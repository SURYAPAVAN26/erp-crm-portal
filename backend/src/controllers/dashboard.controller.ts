import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getSummary(_req: Request, res: Response) {
  const [totalCustomers, activeLeads, totalProducts, lowStockProducts, draftChallans, confirmedChallans] =
    await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: "LEAD" } }),
      prisma.product.count(),
      prisma.product.findMany().then((ps) => ps.filter((p) => p.currentStock <= p.minStockAlert).length),
      prisma.challan.count({ where: { status: "DRAFT" } }),
      prisma.challan.count({ where: { status: "CONFIRMED" } }),
    ]);

  const recentChallans = await prisma.challan.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  res.json({
    success: true,
    data: {
      totalCustomers,
      activeLeads,
      totalProducts,
      lowStockProducts,
      draftChallans,
      confirmedChallans,
      recentChallans,
    },
  });
}
