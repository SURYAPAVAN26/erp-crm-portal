import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";
import { Prisma } from "@prisma/client";

export async function listProducts(req: Request, res: Response) {
  const { skip, take, page, pageSize } = getPagination(req);
  const { search, category, lowStock } = req.query;

  const where: Prisma.ProductWhereInput = {};
  if (search) {
    const s = String(search);
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { sku: { contains: s, mode: "insensitive" } },
    ];
  }
  if (category) where.category = String(category);

  let items = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (lowStock === "true") {
    items = items.filter((p) => p.currentStock <= p.minStockAlert);
  }

  const total = items.length;
  const paged = items.slice(skip, skip + take);

  res.json({ success: true, data: paged, meta: buildMeta(total, page, pageSize) });
}

export async function getProduct(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { movements: { orderBy: { createdAt: "desc" }, take: 50, include: { createdBy: { select: { name: true } } } } },
  });
  if (!product) throw AppError.notFound("Product not found");
  res.json({ success: true, data: product });
}

export async function createProduct(req: Request, res: Response) {
  const body = req.body;
  const existing = await prisma.product.findUnique({ where: { sku: body.sku } });
  if (existing) throw AppError.conflict("A product with this SKU already exists");

  const product = await prisma.product.create({
    data: {
      name: body.name,
      sku: body.sku,
      category: body.category || null,
      unitPrice: body.unitPrice,
      currentStock: body.currentStock ?? 0,
      minStockAlert: body.minStockAlert ?? 0,
      location: body.location || null,
    },
  });
  res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req: Request, res: Response) {
  const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Product not found");

  const body = req.body;
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.sku !== undefined && { sku: body.sku }),
      ...(body.category !== undefined && { category: body.category || null }),
      ...(body.unitPrice !== undefined && { unitPrice: body.unitPrice }),
      ...(body.minStockAlert !== undefined && { minStockAlert: body.minStockAlert }),
      ...(body.location !== undefined && { location: body.location || null }),
      // currentStock is intentionally NOT editable directly here; use /stock endpoint
      // so every change is captured in the StockMovement audit log.
    },
  });
  res.json({ success: true, data: product });
}

// Records a stock movement (IN/OUT) and atomically updates product.currentStock.
// Stock is never allowed to go negative.
export async function recordStockMovement(req: Request, res: Response) {
  const { quantity, type, reason } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw AppError.notFound("Product not found");

    const delta = type === "IN" ? quantity : -quantity;
    const newStock = product.currentStock + delta;

    if (newStock < 0) {
      throw AppError.badRequest(
        `Insufficient stock. Current stock is ${product.currentStock}, cannot remove ${quantity}.`
      );
    }

    const updated = await tx.product.update({
      where: { id: product.id },
      data: { currentStock: newStock },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId: product.id,
        quantity,
        type,
        reason,
        createdById: req.user!.sub,
      },
    });

    return { product: updated, movement };
  });

  res.status(201).json({ success: true, data: result });
}
