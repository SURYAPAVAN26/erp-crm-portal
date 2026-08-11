import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";
import { Prisma } from "@prisma/client";

// Generates a sequential, human-readable challan number, e.g. CH-2026-00042
async function generateChallanNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;
  const count = await tx.challan.count({ where: { challanNumber: { startsWith: prefix } } });
  const next = (count + 1).toString().padStart(5, "0");
  return `${prefix}${next}`;
}

// Deducts stock for each line item of a challan, inside the given transaction.
// Throws if any product has insufficient stock. Also writes StockMovement audit rows.
async function deductStockForChallan(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
  challanNumber: string,
  userId: string
) {
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) throw AppError.notFound(`Product ${item.productId} not found`);

    if (product.currentStock < item.quantity) {
      throw AppError.badRequest(
        `Insufficient stock for "${product.name}" (SKU: ${product.sku}). Available: ${product.currentStock}, requested: ${item.quantity}.`
      );
    }

    await tx.product.update({
      where: { id: product.id },
      data: { currentStock: product.currentStock - item.quantity },
    });

    await tx.stockMovement.create({
      data: {
        productId: product.id,
        quantity: item.quantity,
        type: "OUT",
        reason: `Sales challan ${challanNumber} confirmed`,
        createdById: userId,
      },
    });
  }
}

// Reverses stock deduction when a CONFIRMED challan is cancelled.
async function restockForChallan(
  tx: Prisma.TransactionClient,
  items: { productId: string; quantity: number }[],
  challanNumber: string,
  userId: string
) {
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product) continue;

    await tx.product.update({
      where: { id: product.id },
      data: { currentStock: product.currentStock + item.quantity },
    });

    await tx.stockMovement.create({
      data: {
        productId: product.id,
        quantity: item.quantity,
        type: "IN",
        reason: `Sales challan ${challanNumber} cancelled - stock restored`,
        createdById: userId,
      },
    });
  }
}

export async function listChallans(req: Request, res: Response) {
  const { skip, take, page, pageSize } = getPagination(req);
  const { status, customerId, search } = req.query;

  const where: Prisma.ChallanWhereInput = {};
  if (status) where.status = String(status) as Prisma.EnumChallanStatusFilter["equals"];
  if (customerId) where.customerId = String(customerId);
  if (search) where.challanNumber = { contains: String(search), mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  res.json({ success: true, data: items, meta: buildMeta(total, page, pageSize) });
}

export async function getChallan(req: Request, res: Response) {
  const challan = await prisma.challan.findUnique({
    where: { id: req.params.id },
    include: {
      customer: true,
      createdBy: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true, sku: true } } } },
    },
  });
  if (!challan) throw AppError.notFound("Challan not found");
  res.json({ success: true, data: challan });
}

// Creates a challan. If status = CONFIRMED at creation time, stock is deducted
// immediately within the same transaction. Product snapshot data (name, SKU, price)
// is stored on each line item so historical challans remain accurate even if the
// product is later renamed or repriced.
export async function createChallan(req: Request, res: Response) {
  const { customerId, items, status } = req.body as {
    customerId: string;
    items: { productId: string; quantity: number }[];
    status: "DRAFT" | "CONFIRMED";
  };

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) throw AppError.notFound("Customer not found");

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });
  if (products.length !== new Set(items.map((i) => i.productId)).size) {
    throw AppError.badRequest("One or more products in the challan do not exist");
  }

  const result = await prisma.$transaction(async (tx) => {
    const challanNumber = await generateChallanNumber(tx);
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

    const challan = await tx.challan.create({
      data: {
        challanNumber,
        customerId,
        status: "DRAFT", // always created as DRAFT first, then optionally confirmed below
        totalQuantity,
        createdById: req.user!.sub,
        items: {
          create: items.map((i) => {
            const product = products.find((p) => p.id === i.productId)!;
            return {
              productId: product.id,
              productNameSnapshot: product.name,
              productSkuSnapshot: product.sku,
              unitPriceSnapshot: product.unitPrice,
              quantity: i.quantity,
            };
          }),
        },
      },
      include: { items: true },
    });

    if (status === "CONFIRMED") {
      await deductStockForChallan(tx, items, challanNumber, req.user!.sub);
      return tx.challan.update({
        where: { id: challan.id },
        data: { status: "CONFIRMED" },
        include: { items: true, customer: true },
      });
    }

    return challan;
  });

  res.status(201).json({ success: true, data: result });
}

// Confirms a DRAFT challan: deducts stock. Fails atomically if any item has
// insufficient stock (no partial deduction).
export async function confirmChallan(req: Request, res: Response) {
  const result = await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!challan) throw AppError.notFound("Challan not found");
    if (challan.status !== "DRAFT") {
      throw AppError.badRequest(`Only DRAFT challans can be confirmed. Current status: ${challan.status}`);
    }

    await deductStockForChallan(
      tx,
      challan.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      challan.challanNumber,
      req.user!.sub
    );

    return tx.challan.update({
      where: { id: challan.id },
      data: { status: "CONFIRMED" },
      include: { items: true, customer: true },
    });
  });

  res.json({ success: true, data: result });
}

// Cancels a challan. If it was CONFIRMED, stock is restored automatically.
export async function cancelChallan(req: Request, res: Response) {
  const result = await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!challan) throw AppError.notFound("Challan not found");
    if (challan.status === "CANCELLED") {
      throw AppError.badRequest("Challan is already cancelled");
    }

    if (challan.status === "CONFIRMED") {
      await restockForChallan(
        tx,
        challan.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        challan.challanNumber,
        req.user!.sub
      );
    }

    return tx.challan.update({
      where: { id: challan.id },
      data: { status: "CANCELLED" },
      include: { items: true, customer: true },
    });
  });

  res.json({ success: true, data: result });
}
