// src/app/admin/page.tsx
import prisma from "@/lib/prisma";
import AdminReviewControls from "@/components/AdminReviewControls";
import AdminFacultyControls from "@/components/AdminFacultyControls";
import AdminStudentList from "@/components/AdminStudentList";
import AdminFacultyList from "@/components/AdminFacultyList";
import AdminDepartmentManager from "@/components/AdminDepartmentManager"; 
import AdminReportControls from "@/components/AdminReportControls";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReportedReview } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/");
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") redirect("/");

  // ১. স্ট্যাটাস কাউন্ট (Stats)
  const [userCount, facultyCount, reviewCount, departmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.faculty.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.department.count(),
  ]);

  // ২. পেন্ডিং ডাটা ফেচিং
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
    include: { 
      user: { select: { nickname: true } }, 
      review: { 
        include: { 
          user: { select: { nickname: true } }, 
          faculty: { select: { name: true } } 
        } 
      } 
    }
  });

  // ৩. ফুল ডাটাবেস লিস্ট (ম্যানেজমেন্টের জন্য)
  const allStudents = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { reviews: true }
  });

  const allFaculties = await prisma.faculty.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    include: { reviews: true }
  });

  const allDepartments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, reviews, and content.</p>
          </div>
          <Link href="/" className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition font-medium shadow-sm">
            ⬅ Back to Home
          </Link>
        </header>

        {/* --- Stats Cards (New) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Students" count={userCount} icon="👥" color="bg-blue-500" />
          <StatCard title="Active Faculties" count={facultyCount} icon="👨‍🏫" color="bg-purple-500" />
          <StatCard title="Total Reviews" count={reviewCount} icon="📝" color="bg-green-500" />
          <StatCard title="Departments" count={departmentCount} icon="🏢" color="bg-orange-500" />
        </div>

        <div className="space-y-12">
          
          {/* --- 1. URGENT ACTIONS (Reports & Pending) --- */}
          {(reportedReviews.length > 0 || pendingReviews.length > 0 || pendingFaculties.length > 0) && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white border-l-4 border-red-500 pl-3">
                ⚠️ Action Required
              </h2>

              {/* Reports Section */}
              {reportedReviews.length > 0 && (
                <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-500/30 shadow-sm">
                  <h3 className="text-lg mb-4 text-red-700 dark:text-red-400 font-bold flex items-center gap-2">
                    🚩 Reported Reviews ({reportedReviews.length})
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {reportedReviews.map((report: any) => (
                      <div key={report.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-red-100 dark:border-red-500/20 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">Reason: {report.reason}</span>
                          <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-3">
                          "{report.review?.comment || 'Content removed'}"
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">By: {report.review?.user?.nickname || "Anon"}</span>
                          <AdminReportControls reviewId={report.reviewId} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Faculties */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg mb-4 text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2">
                    📢 Faculty Requests ({pendingFaculties.length})
                  </h3>
                  {pendingFaculties.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No pending faculty requests.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      {pendingFaculties.map((f) => (
                          <div key={f.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600 flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{f.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{f.department}</p>
                            </div>
                            <AdminFacultyControls facultyId={f.id} />
                          </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Pending Reviews */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-lg mb-4 text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-2">
                    📝 Review Approvals ({pendingReviews.length})
                  </h3>
                  {pendingReviews.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">No reviews pending approval.</p>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      {pendingReviews.map((r) => (
                          <div key={r.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">"{r.comment}"</p>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-2 text-xs">
                                  <span className="text-yellow-500 font-bold">★ {r.rating}</span>
                                  <span className="text-gray-400">for {r.faculty.name}</span>
                                </div>
                                <AdminReviewControls reviewId={r.id} />
                            </div>
                          </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}

          {/* --- 2. SYSTEM MANAGEMENT --- */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
              ⚙️ System Management
            </h2>
            
            <div className="grid grid-cols-1 gap-10">
              
              {/* Department Manager */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Departments</h3>
                  <p className="text-sm text-gray-500">Manage university departments list.</p>
                </div>
                <AdminDepartmentManager departments={allDepartments} />
              </div>

              {/* Student & Faculty Lists (Tabs or Split) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                   <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Users / Students</h3>
                   <AdminStudentList students={allStudents} />
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                   <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Faculties Database</h3>
                   <AdminFacultyList faculties={allFaculties} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatCard({ title, count, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{count}</p>
      </div>
      <div className={`w-12 h-12 ${color} text-white rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
        {icon}
      </div>
    </div>
  );
}