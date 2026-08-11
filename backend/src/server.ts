import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import bcrypt from "bcryptjs";

async function ensureSeed() {
  try {
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

    const customerCount = await prisma.customer.count();
    if (customerCount === 0) {
      console.log("Seeding sample customers, products, stock movements & challans...");

      const c1 = await prisma.customer.create({
        data: {
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

      const c2 = await prisma.customer.create({
        data: {
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

      const c3 = await prisma.customer.create({
        data: {
          name: "Apex Distributors",
          mobile: "9825012345",
          email: "sales@apexdist.com",
          businessName: "Apex Distribution Network",
          gstNumber: "27BBBBA1111B1Z2",
          customerType: "DISTRIBUTOR",
          address: "GIDC Industrial Estate, Ahmedabad",
          status: "ACTIVE",
          notes: "Statewide wholesale distributor.",
        },
      });

      const c4 = await prisma.customer.create({
        data: {
          name: "Sunrise Electricals",
          mobile: "9426098765",
          email: "info@sunriseelectric.com",
          businessName: "Sunrise Electrical Supplies",
          customerType: "RETAIL",
          address: "Ring Road, Surat",
          status: "ACTIVE",
          notes: "Frequent buyer of switches & wiring.",
        },
      });

      const c5 = await prisma.customer.create({
        data: {
          name: "Metro Hardware Mart",
          mobile: "9712341122",
          email: "purchase@metrohardware.com",
          businessName: "Metro Hardware Mart",
          customerType: "DISTRIBUTOR",
          address: "Subhash Bridge, Rajkot",
          status: "LEAD",
          followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          notes: "New inquiry for circuit breakers.",
        },
      });

      // Products
      const p1 = await prisma.product.create({
        data: {
          name: "LED Bulb 9W",
          sku: "PRD-001",
          category: "Electronics",
          unitPrice: 85.0,
          currentStock: 500,
          minStockAlert: 50,
          location: "Warehouse A - Rack 3",
        },
      });

      const p2 = await prisma.product.create({
        data: {
          name: "Ceiling Fan 48-inch",
          sku: "PRD-002",
          category: "Electronics",
          unitPrice: 1450.0,
          currentStock: 40,
          minStockAlert: 10,
          location: "Warehouse A - Rack 7",
        },
      });

      const p3 = await prisma.product.create({
        data: {
          name: "Extension Board 6-socket",
          sku: "PRD-003",
          category: "Electronics",
          unitPrice: 320.0,
          currentStock: 8,
          minStockAlert: 15, // Triggers Low Stock Alert
          location: "Warehouse B - Rack 1",
        },
      });

      const p4 = await prisma.product.create({
        data: {
          name: "Copper Wire 90m Roll",
          sku: "PRD-004",
          category: "Electrical",
          unitPrice: 1250.0,
          currentStock: 12,
          minStockAlert: 20, // Triggers Low Stock Alert
          location: "Warehouse B - Rack 5",
        },
      });

      const p5 = await prisma.product.create({
        data: {
          name: "Modular Switch 16A",
          sku: "PRD-005",
          category: "Electrical",
          unitPrice: 65.0,
          currentStock: 250,
          minStockAlert: 30,
          location: "Warehouse A - Shelf 12",
        },
      });

      // Stock audit records
      await prisma.stockMovement.createMany({
        data: [
          { productId: p1.id, quantity: 500, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
          { productId: p2.id, quantity: 40, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
          { productId: p3.id, quantity: 8, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
          { productId: p4.id, quantity: 12, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
          { productId: p5.id, quantity: 250, type: "IN", reason: "Initial stock load", createdById: warehouse.id },
        ],
      });

      // Challans
      await prisma.challan.create({
        data: {
          challanNumber: "CH-2026-00001",
          customerId: c1.id,
          status: "CONFIRMED",
          totalQuantity: 20,
          createdById: sales.id,
          items: {
            create: [
              {
                productId: p1.id,
                productNameSnapshot: p1.name,
                productSkuSnapshot: p1.sku,
                unitPriceSnapshot: p1.unitPrice,
                quantity: 20,
              },
            ],
          },
        },
      });

      await prisma.challan.create({
        data: {
          challanNumber: "CH-2026-00002",
          customerId: c2.id,
          status: "DRAFT",
          totalQuantity: 15,
          createdById: sales.id,
          items: {
            create: [
              {
                productId: p2.id,
                productNameSnapshot: p2.name,
                productSkuSnapshot: p2.sku,
                unitPriceSnapshot: p2.unitPrice,
                quantity: 5,
              },
              {
                productId: p5.id,
                productNameSnapshot: p5.name,
                productSkuSnapshot: p5.sku,
                unitPriceSnapshot: p5.unitPrice,
                quantity: 10,
              },
            ],
          },
        },
      });

      await prisma.challan.create({
        data: {
          challanNumber: "CH-2026-00003",
          customerId: c3.id,
          status: "CONFIRMED",
          totalQuantity: 50,
          createdById: sales.id,
          items: {
            create: [
              {
                productId: p1.id,
                productNameSnapshot: p1.name,
                productSkuSnapshot: p1.sku,
                unitPriceSnapshot: p1.unitPrice,
                quantity: 50,
              },
            ],
          },
        },
      });

      console.log("Comprehensive seed completed successfully!");
    }
  } catch (err) {
    console.error("Auto-seed check error:", err);
  }
}

function main() {
  app.listen(env.port, "0.0.0.0", () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
    prisma
      .$connect()
      .then(() => ensureSeed())
      .catch((err) => {
        console.error("Failed to connect to database on startup:", err);
      });
  });
}

main();

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
