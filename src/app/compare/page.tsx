
import prisma from "@/lib/prisma";
import CompareView from "@/components/CompareView";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function ComparePage() {
  const faculties = await prisma.faculty.findMany({
    include: { reviews: { select: { rating: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 max-w-6xl mx-auto">
        <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 block">← Back to Home</Link>
      </header>

      <main className="flex justify-center">
        <CompareView faculties={faculties} />
      </main>
    </div>
  );
}