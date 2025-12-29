import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🛠 Starting Department Fix (String Mode)...");

  // ডুপ্লিকেট ম্যাপিং (Long Name -> Short Code)
  const duplicates = [
    { long: "Computer Science and Engineering", short: "CSE" },
    { long: "Electrical and Electronic Engineering", short: "EEE" },
    { long: "Civil Engineering", short: "CE" },
  ];

  for (const item of duplicates) {
    console.log(`--- Processing: "${item.long}" -> "${item.short}" ---`);

    // ১. ফ্যাকাল্টি টেবিলে আপডেট করা (String Match)
    // যাদের department ফিল্ডে লং নেম আছে, তাদের শর্ট নেম করে দেওয়া হচ্ছে
    const updateResult = await prisma.faculty.updateMany({
      where: {
        department: item.long, // লজিক: যেখানে ডিপার্টমেন্ট নাম = লম্বা নাম
      },
      data: {
        department: item.short, // অ্যাকশন: সেটাকে ছোট নাম করে দাও
      },
    });

    console.log(`✅ Updated ${updateResult.count} faculties to use "${item.short}".`);

    // ২. ডিপার্টমেন্ট টেবিল থেকে লং নেম ডিলিট করা
    // যাতে ড্রপডাউনে আর লম্বা নাম না দেখায়
    try {
      const longDept = await prisma.department.findUnique({
        where: { name: item.long },
      });

      if (longDept) {
        await prisma.department.delete({
          where: { id: longDept.id },
        });
        console.log(`🗑️ Deleted duplicate department entry: "${item.long}"`);
      } else {
        console.log(`ℹ️ Department "${item.long}" not found in Department table (already deleted?).`);
      }
    } catch (error) {
      console.log(`⚠️ Could not delete "${item.long}". It might not exist or implies a constraint.`);
    }
  }

  console.log("\n✅ Fix completed successfully! Now your database is clean.");
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