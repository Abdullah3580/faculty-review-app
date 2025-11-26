// src/app/admin/page.tsx
import prisma from "@/lib/prisma";
import AdminReviewControls from "@/components/AdminReviewControls";
import AdminFacultyControls from "@/components/AdminFacultyControls";
import AdminStudentList from "@/components/AdminStudentList";
import AdminFacultyList from "@/components/AdminFacultyList";
import AdminDepartmentManager from "@/components/AdminDepartmentManager"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminReportControls from "@/components/AdminReportControls";

type ReportedReview = {
  id: string;
  reason: string;
  reviewId: string;
  createdAt: Date;
  user: {
    nickname: string;
  };
  review: {
    id: string;
    comment: string; // তোমার কোডে comment ব্যবহার হয়েছে, তাই এটা ধরে নিচ্ছি
    user: {
      nickname: string;
    };
    faculty: {
      name: string;
    };
  };
};


export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") redirect("/");

  // ১. পেন্ডিং ডাটা ফেচিং
  const pendingReviews = await prisma.review.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { nickname: true, email: true } }, faculty: { select: { name: true } } },
  });

  const pendingFaculties = await prisma.faculty.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const reportedReviews = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { nickname: true } }, review: { include: { user: { select: { nickname: true } }, faculty: { select: { name: true } } } } }
  });

  // ২. ফুল ডাটাবেস লিস্ট (ম্যানেজমেন্টের জন্য)
  const allStudents = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { reviews: true }
  });

  const allFaculties = await prisma.faculty.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    include: { reviews: true }
  });

  // --- এই লাইনটি মিসিং ছিল, তাই এরর আসছিল ---
  const allDepartments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });
  // -------------------------------------------

  return (
    <div className="min-h-screen p-8">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
          Admin Dashboard
        </h1>
        <Link href="/" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm font-medium">
          ⬅ Back to Home
        </Link>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        
        {/* Reports Section */}
        {reportedReviews.length > 0 && (
          <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-200 dark:border-red-500/30 shadow-lg">
            <h2 className="text-xl mb-4 text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
              🚩 Reported Reviews ({reportedReviews.length})
            </h2>
            <div className="grid gap-4">
              {reportedReviews.map((report: ReportedReview) => (
                <div key={report.id} className="bg-white dark:bg-gray-800 p-4 rounded border border-red-200 dark:border-red-500/20">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Reason: <span className="text-red-500 dark:text-red-300 font-bold">{report.reason}</span></p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded text-sm italic text-gray-700 dark:text-gray-300">"{report.review.comment}"</div>
                  <div className="mt-3 flex justify-end"><AdminReportControls reviewId={report.reviewId} /></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Faculties */}
          <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl mb-4 text-indigo-600 dark:text-indigo-400 font-bold">📢 Faculty Requests ({pendingFaculties.length})</h2>
            {pendingFaculties.length === 0 ? <p className="text-gray-500 italic">No requests.</p> : (
              <div className="space-y-3">
                {pendingFaculties.map((f) => (
                   <div key={f.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600 flex justify-between items-center">
                     <div><h3 className="font-bold text-gray-900 dark:text-white">{f.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{f.department}</p></div>
                     <AdminFacultyControls facultyId={f.id} />
                   </div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Reviews */}
          <section className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-xl mb-4 text-yellow-600 dark:text-yellow-400 font-bold">📝 Review Approvals ({pendingReviews.length})</h2>
            {pendingReviews.length === 0 ? <p className="text-gray-500 italic">All clear.</p> : (
              <div className="space-y-3">
                {pendingReviews.map((r) => (
                   <div key={r.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                     <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">"{r.comment}"</p>
                     <div className="flex justify-between items-center">
                        <span className="text-xs text-yellow-500 dark:text-yellow-400">★ {r.rating}</span>
                        <AdminReviewControls reviewId={r.id} />
                     </div>
                   </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Database Management */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Database Management</h1>
          
          <div className="mb-8">
            {/* এখানে আমরা allDepartments পাস করছি */}
            <AdminDepartmentManager departments={allDepartments} />
          </div>

          <AdminStudentList students={allStudents} />
          <AdminFacultyList faculties={allFaculties} />
        </div>
      </main>
    </div>
  );
}