import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Passw0rd!", 10);

  const [admin, sales, warehouse, accounts] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@erp.com" },
      update: {},
      create: { name: "Admin User", email: "admin@erp.com", password, role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "sales@erp.com" },
      update: {},
      create: { name: "Sales User", email: "sales@erp.com", password, role: "SALES" },
    }),
    prisma.user.upsert({
      where: { email: "warehouse@erp.com" },
      update: {},
      create: { name: "Warehouse User", email: "warehouse@erp.com", password, role: "WAREHOUSE" },
    }),
    prisma.user.upsert({
      where: { email: "accounts@erp.com" },
      update: {},
      create: { name: "Accounts User", email: "accounts@erp.com", password, role: "ACCOUNTS" },
    }),
  ]);

  const customer1 = await prisma.customer.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Rajesh Traders",
      mobile: "9876543210",
      email: "rajesh@traders.com",
      businessName: "Rajesh Traders Pvt Ltd",
      gstNumber: "24AAAAA0000A1Z5",
      customerType: "WHOLESALE",
      address: "MG Road, Vadodara, Gujarat",
      status: "ACTIVE",
      notes: "Regular bulk buyer, prefers monthly billing.",
    },
  });

  await prisma.customer.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Priya Retail Store",
      mobile: "9123456780",
      email: "priya@retail.com",
      businessName: "Priya Retail",
      customerType: "RETAIL",
      address: "Station Road, Anand, Gujarat",
      status: "LEAD",
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "Interested in electronics category, follow up next week.",
    },
  });

  const product1 = await prisma.product.upsert({
    where: { sku: "PRD-001" },
    update: {},
    create: {
      name: "LED Bulb 9W",
      sku: "PRD-001",
      category: "Electronics",
      unitPrice: 85.0,
      currentStock: 500,
      minStockAlert: 50,
      location: "Warehouse A - Rack 3",
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: "PRD-002" },
    update: {},
    create: {
      name: "Ceiling Fan 48-inch",
      sku: "PRD-002",
      category: "Electronics",
      unitPrice: 1450.0,
      currentStock: 40,
      minStockAlert: 10,
      location: "Warehouse A - Rack 7",
    },
  });

  await prisma.product.upsert({
    where: { sku: "PRD-003" },
    update: {},
    create: {
      name: "Extension Board 6-socket",
      sku: "PRD-003",
      category: "Electronics",
      unitPrice: 320.0,
      currentStock: 8,
      minStockAlert: 15, // intentionally below threshold to demo low-stock alert
      location: "Warehouse B - Rack 1",
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      { productId: product1.id, quantity: 500, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
      { productId: product2.id, quantity: 40, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
    ],
  });

  const existingChallan = await prisma.challan.findUnique({ where: { challanNumber: "CH-DEMO-00001" } });
  if (!existingChallan) {
    await prisma.challan.create({
      data: {
        challanNumber: "CH-DEMO-00001",
        customerId: customer1.id,
        status: "DRAFT",
        totalQuantity: 10,
        createdById: sales.id,
        items: {
          create: [
            {
              productId: product1.id,
              productNameSnapshot: product1.name,
              productSkuSnapshot: product1.sku,
              unitPriceSnapshot: product1.unitPrice,
              quantity: 10,
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login credentials (password for all: Passw0rd!):");
  console.log(` - Admin:     ${admin.email}`);
  console.log(` - Sales:     ${sales.email}`);
  console.log(` - Warehouse: ${warehouse.email}`);
  console.log(` - Accounts:  ${accounts.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
