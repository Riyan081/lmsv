import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Delete old "Unknown user" activity logs
  const deleted = await prisma.activityLog.deleteMany({
    where: { description: { contains: "Unknown user" } },
  });
  console.log(`Deleted ${deleted.count} "Unknown user" activity logs`);

  // Also delete any activity logs with null userId from login events
  const deleted2 = await prisma.activityLog.deleteMany({
    where: { action: "login", userId: null },
  });
  console.log(`Deleted ${deleted2.count} null-userId login logs`);
}

main().then(() => prisma.$disconnect());
