import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { getPagination, buildMeta } from "../utils/pagination";
import { Prisma } from "@prisma/client";

export async function listCustomers(req: Request, res: Response) {
  const { skip, take, page, pageSize } = getPagination(req);
  const { search, status, customerType } = req.query;

  const where: Prisma.CustomerWhereInput = {};

  if (search) {
    const s = String(search);
    where.OR = [
      { name: { contains: s, mode: "insensitive" } },
      { mobile: { contains: s, mode: "insensitive" } },
      { email: { contains: s, mode: "insensitive" } },
      { businessName: { contains: s, mode: "insensitive" } },
    ];
  }
  if (status) where.status = String(status) as Prisma.EnumCustomerStatusFilter["equals"];
  if (customerType) where.customerType = String(customerType) as Prisma.EnumCustomerTypeFilter["equals"];

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { followUps: true, challans: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  res.json({ success: true, data: items, meta: buildMeta(total, page, pageSize) });
}

export async function getCustomer(req: Request, res: Response) {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      followUps: { orderBy: { date: "desc" }, include: { createdBy: { select: { name: true } } } },
      challans: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) throw AppError.notFound("Customer not found");
  res.json({ success: true, data: customer });
}

export async function createCustomer(req: Request, res: Response) {
  const body = req.body;
  const customer = await prisma.customer.create({
    data: {
      name: body.name,
      mobile: body.mobile,
      email: body.email || null,
      businessName: body.businessName || null,
      gstNumber: body.gstNumber || null,
      customerType: body.customerType,
      address: body.address || null,
      status: body.status,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      notes: body.notes || null,
    },
  });
  res.status(201).json({ success: true, data: customer });
}

export async function updateCustomer(req: Request, res: Response) {
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) throw AppError.notFound("Customer not found");

  const body = req.body;
  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.mobile !== undefined && { mobile: body.mobile }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.businessName !== undefined && { businessName: body.businessName || null }),
      ...(body.gstNumber !== undefined && { gstNumber: body.gstNumber || null }),
      ...(body.customerType !== undefined && { customerType: body.customerType }),
      ...(body.address !== undefined && { address: body.address || null }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.followUpDate !== undefined && {
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
  });
  res.json({ success: true, data: customer });
}

export async function addFollowUp(req: Request, res: Response) {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!customer) throw AppError.notFound("Customer not found");

  const followUp = await prisma.followUp.create({
    data: {
      customerId: customer.id,
      note: req.body.note,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      createdById: req.user!.sub,
    },
  });

  res.status(201).json({ success: true, data: followUp });
}
