import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

import bcrypt from "bcryptjs";

async function ensureSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log("No users found in database. Initializing default seed accounts...");
      const password = await bcrypt.hash("Passw0rd!", 10);
      await prisma.user.createMany({
        data: [
          { name: "Admin User", email: "admin@erp.com", password, role: "ADMIN" },
          { name: "Sales User", email: "sales@erp.com", password, role: "SALES" },
          { name: "Warehouse User", email: "warehouse@erp.com", password, role: "WAREHOUSE" },
          { name: "Accounts User", email: "accounts@erp.com", password, role: "ACCOUNTS" },
        ],
        skipDuplicates: true,
      });
      console.log("Auto-seed completed successfully.");
    }
  } catch (err) {
    console.error("Auto-seed check error:", err);
  }
}

async function main() {
  await prisma.$connect();
  await ensureSeed();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} [${env.nodeEnv}]`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
