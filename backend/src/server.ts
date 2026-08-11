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

function main() {
  app.listen(env.port, () => {
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
