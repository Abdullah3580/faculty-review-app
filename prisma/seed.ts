import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bsbgeFacultyList = [
  { name: "Dr. S.M. Rafiqul Islam", designation: "Associate Professor & Head of Dept.", email: "rafiqul@bge.uiu.ac.bd", roomNumber: "3701" },
  { name: "Dr. Nahid Tamanna", designation: "Assistant Professor", email: "tamanna@bge.uiu.ac.bd", roomNumber: "7211" },
  { name: "Md. Belal Hussain Ripon", designation: "Lecturer", email: "belal@bge.uiu.ac.bd", roomNumber: "7210" },
  { name: "Khalid Shahriar", designation: "Lecturer", email: "shahriar@bge.uiu.ac.bd", roomNumber: "3139" },
  { name: "Md. Zahin Alam", designation: "Lecturer", email: "zahin@bge.uiu.ac.bd", roomNumber: "3139" }
];

async function main() {
  console.log("🌱 Start seeding BSBGE (Biotech) Faculty...");

  // ১. BSBGE Department তৈরি বা নিশ্চিত করা
  const department = await prisma.department.upsert({
    where: { name: "BSBGE" },
    update: {},
    create: {
      name: "BSBGE", // Short Code matches your database screenshot
    },
  });

  console.log(`✅ Department Ready: ${department.name}`);

  // ২. ফ্যাকাল্টি লুপ
  for (const faculty of bsbgeFacultyList) {
    const initial = faculty.email.split("@")[0];

    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        email: faculty.email,
      },
    });

    if (existingFaculty) {
      await prisma.faculty.update({
        where: { id: existingFaculty.id },
        data: {
          name: faculty.name,
          designation: faculty.designation,
          department: "BSBGE",
          initial: initial,
          roomNumber: faculty.roomNumber,
        },
      });
    } else {
      await prisma.faculty.create({
        data: {
          name: faculty.name,
          email: faculty.email,
          designation: faculty.designation,
          department: "BSBGE",
          initial: initial,
          status: "APPROVED",
          roomNumber: faculty.roomNumber,
        },
      });
    }
  }

  console.log(`✅ Seeded ${bsbgeFacultyList.length} BSBGE faculty members successfully.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });