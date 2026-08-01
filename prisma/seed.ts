import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface FacultyData {
  name: string;
  email: string;
  initial: string | null;
  department: string;
  designation: string;
}

async function main() {
  const jsonPath = path.join(__dirname, "faculty_seed.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const facultyData: FacultyData[] = JSON.parse(raw);

  console.log(`🌱 Seeding শুরু: ${facultyData.length} faculty records`);

  let added = 0;
  let updated = 0;

  for (const faculty of facultyData) {
    if (!faculty.email || !faculty.name) continue;

    // email দিয়ে আগে আছে কিনা চেক
    const existing = await prisma.faculty.findFirst({
      where: { email: { equals: faculty.email, mode: "insensitive" } },
    });

    if (existing) {
      // আছে — শুধু missing/empty field গুলো আপডেট করো
      await prisma.faculty.update({
        where: { id: existing.id },
        data: {
          // email যদি আগে না থাকে তাহলে যোগ করো
          email: existing.email || faculty.email,
          // initial যদি আগে না থাকে তাহলে যোগ করো
          initial: existing.initial || faculty.initial || null,
          // designation যদি "Lecturer" এর চেয়ে ভালো থাকে তাহলে রাখো
          designation:
            existing.designation && existing.designation !== "Lecturer"
              ? existing.designation
              : faculty.designation,
        },
      });
      updated++;
    } else {
      // নেই — নতুন add করো
      await prisma.faculty.create({
        data: {
          name: faculty.name,
          email: faculty.email,
          initial: faculty.initial || null,
          department: faculty.department,
          designation: faculty.designation || "Lecturer",
          status: "APPROVED",
        },
      });
      added++;
    }
  }

  console.log(`\n✅ Seeding সম্পন্ন!`);
  console.log(`   নতুন যোগ: ${added}`);
  console.log(`   আপডেট: ${updated}`);
  console.log(`   মোট: ${added + updated}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());