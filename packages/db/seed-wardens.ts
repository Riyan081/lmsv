import { PrismaClient, Gender } from "@prisma/client";
import { auth } from "../auth/src/auth";

const prisma = new PrismaClient();
const PASSWORD = "password123";

async function createWarden(data: {
  email: string;
  name: string;
  phone?: string;
  gender?: Gender;
  employeeId?: string;
}) {
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    const result = await auth.api.signUpEmail({
      body: { email: data.email, password: PASSWORD, name: data.name },
    });
    if (!result?.user) throw new Error(`Failed to create user: ${data.email}`);

    user = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: "warden",
        phone: data.phone,
        gender: data.gender,
        employeeId: data.employeeId,
        emailVerified: true,
      },
    });
    console.log(`Created warden user: ${data.name} (${data.email})`);
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: "warden" },
    });
    console.log(`Updated existing user to warden: ${data.name} (${data.email})`);
  }

  return user;
}

async function main() {
  console.log("Creating warden users...");

  const wardenBoys = await createWarden({
    email: "warden.boys@college.com",
    name: "Mr. Ramesh Yadav",
    phone: "9876543201",
    gender: "male" as Gender,
    employeeId: "EMP-WRD-001",
  });

  const wardenGirls = await createWarden({
    email: "warden.girls@college.com",
    name: "Mrs. Sunita Devi",
    phone: "9876543202",
    gender: "female" as Gender,
    employeeId: "EMP-WRD-002",
  });

  // Also assign wardens to existing hostels if unassigned
  const boysHostels = await prisma.hostel.findMany({ where: { type: "boys", wardenId: null } });
  for (const h of boysHostels) {
    await prisma.hostel.update({ where: { id: h.id }, data: { wardenId: wardenBoys.id } });
    console.log(`Assigned ${wardenBoys.name} to ${h.name}`);
  }

  const girlsHostels = await prisma.hostel.findMany({ where: { type: "girls", wardenId: null } });
  for (const h of girlsHostels) {
    await prisma.hostel.update({ where: { id: h.id }, data: { wardenId: wardenGirls.id } });
    console.log(`Assigned ${wardenGirls.name} to ${h.name}`);
  }

  console.log("✅ Wardens created and assigned successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
