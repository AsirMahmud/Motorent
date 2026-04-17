import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@motorent.com";
  const adminPassword = "Admin@123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
      verificationStatus: "APPROVED",
    },
    create: {
      fullName: "System Admin",
      email: adminEmail,
      phone: "+8801800000000",
      passwordHash,
      role: "ADMIN",
      verificationStatus: "APPROVED",
    },
  });

  console.log("Seed complete");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
