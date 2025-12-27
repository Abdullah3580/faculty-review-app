import prisma from "@/lib/prisma";
import AdminReviewControls from "@/components/AdminReviewControls";
import AdminFacultyControls from "@/components/AdminFacultyControls";
import AdminReportControls from "@/components/AdminReportControls";
import AdminDashboardSections from "@/components/AdminDashboardSections"; 
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.email) redirect("/");
  
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  // @ts-ignore
  if (!user || user.role?.toUpperCase() !== "ADMIN") redirect("/");

  // 1. ডাটা কাউন্টিং
  const [userCount, facultyCount, reviewCount, departmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.faculty.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.department.count(),
  ]);

  // 2. পেন্ডিং রিকোয়েস্ট (জরুরি অ্যাকশনের জন্য)
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
      review: { include: { user: { select: { nickname: true } }, faculty: { select: { name: true } } } } 
    }
  });

  // 3. ম্যানেজমেন্ট ডাটা
  const allDepartments = await prisma.department.findMany({ orderBy: { name: "asc" } });
  const allStudents = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { reviews: true } });
  const allFaculties = await prisma.faculty.findMany({ where: { status: "APPROVED" }, orderBy: { name: "asc" }, include: { reviews: true } });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage users, reviews, and content.</p>
          </div>
          <Link href="/" className="glass-card px-5 py-2.5 rounded-lg hover:scale-105 transition font-medium text-gray-700 dark:text-gray-300">
            ⬅ Back to Home
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Students" count={userCount} icon="👥" color="bg-blue-500" />
          <StatCard title="Active Faculties" count={facultyCount} icon="👨‍🏫" color="bg-purple-500" />
          <StatCard title="Total Reviews" count={reviewCount} icon="📝" color="bg-green-500" />
          <StatCard title="Departments" count={departmentCount} icon="🏢" color="bg-orange-500" />
        </div>

        {/* Urgent Actions Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {pendingReviews.length > 0 && (
             // এখানে 'as any' ব্যবহার করায় লাল দাগ চলে যাবে
             <AdminReviewControls pendingReviews={pendingReviews as any} />
          )}
          {pendingFaculties.length > 0 && (
             <AdminFacultyControls pendingFaculties={pendingFaculties as any} />
          )}
          {reportedReviews.length > 0 && (
             <AdminReportControls reportedReviews={reportedReviews as any} />
          )}
        </div>

        {/* System Management (Collapsible Sections) */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            ⚙️ System Management
          </h2>
          
          <AdminDashboardSections 
            departments={allDepartments}
            students={allStudents}
            faculties={allFaculties}
          />
        </div>

      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, count, icon, color }: any) {
  return (
    <div className="glass-card p-6 rounded-xl hover:scale-[1.05] transition-transform duration-300 flex items-center justify-between">
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