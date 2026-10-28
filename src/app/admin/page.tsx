// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import AdminReviewControls from "@/components/AdminReviewControls";
import AdminFacultyControls from "@/components/AdminFacultyControls";
import AdminReportControls from "@/components/AdminReportControls";
import AdminDashboardSections from "@/components/AdminDashboardSections";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import OnlineUsers from "@/components/OnlineUsers";
import AdminContactStudents from "@/components/AdminContactStudents";
import AdminDisplayOrderControl from "@/components/AdminDisplayOrderControl";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session || !session.user?.email) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  // @ts-ignore
  if (!user || user.role?.toUpperCase() !== "ADMIN") redirect("/");

  // 1. ডাটা কাউন্টিং
  const [userCount, facultyCount, reviewCount, departmentCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.faculty.count({ where: { status: "APPROVED" } }),
      prisma.review.count({ where: { status: "APPROVED" } }),
      prisma.department.count(),
    ]);

  // 2. পেন্ডিং রিকোয়েস্ট (জরুরি অ্যাকশনের জন্য)
  const pendingReviews = await prisma.review.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nickname: true, email: true } },
      faculty: { select: { name: true } },
    },
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
          faculty: { select: { name: true } },
        },
      },
    },
  });

  // 3. ম্যানেজমেন্ট ডাটা
  const allDepartments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const allStudents = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { reviews: true },
  });

  const allFaculties = await prisma.faculty.findMany({
    where: { status: "APPROVED" },
    orderBy: { name: "asc" },
    include: { reviews: true },
  });

  // 4. Display Order Settings (Compound Sort Criteria)
  const [sortCriteriaSetting, deptOrderSetting] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { key: "faculty_sort_criteria" } }),
    prisma.siteSetting.findUnique({ where: { key: "dept_priority_order" } }),
  ]);

  const currentSortCriteria: string[] = sortCriteriaSetting?.value
    ? JSON.parse(sortCriteriaSetting.value)
    : ["reviews_desc"];

  const currentDeptOrder: string[] = deptOrderSetting?.value
    ? JSON.parse(deptOrderSetting.value)
    : [];

  const allDeptNames = allDepartments.map((d) => d.name);

  const totalPendingActionCount =
    pendingReviews.length + pendingFaculties.length + reportedReviews.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100/50 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-10 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 rounded-3xl bg-white/70 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-800/80 shadow-xl backdrop-blur-xl gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                🛡️ Control Center
              </span>
              {totalPendingActionCount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                  ⚡ {totalPendingActionCount} Pending Actions
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Dashboard</span>
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl">
              Monitor statistics, moderate pending submissions, manage users, and adjust display priorities.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-gray-700 dark:text-gray-300 transition-all duration-300 font-bold text-sm shadow-sm group hover:shadow-indigo-500/25 shrink-0"
          >
            <span className="group-hover:-translate-x-1 transition-transform">⬅</span> Back to Home
          </Link>
        </header>

        {/* Pending Actions Notification Banner */}
        {totalPendingActionCount > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-bold text-sm">Action Required!</p>
                <p className="text-xs opacity-90">
                  You have {pendingReviews.length} pending reviews, {pendingFaculties.length} pending faculties, and {reportedReviews.length} reported reviews waiting for review.
                </p>
              </div>
            </div>
            <a
              href="#pending-actions"
              className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition shadow-sm"
            >
              Review Now ↓
            </a>
          </div>
        )}

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Students"
            count={userCount}
            icon="👥"
            gradient="from-blue-500 to-cyan-500"
            bgGlow="group-hover:shadow-blue-500/20"
          />
          <StatCard
            title="Active Faculties"
            count={facultyCount}
            icon="👨‍🏫"
            gradient="from-purple-500 to-indigo-500"
            bgGlow="group-hover:shadow-purple-500/20"
          />
          <StatCard
            title="Total Reviews"
            count={reviewCount}
            icon="📝"
            gradient="from-emerald-500 to-teal-500"
            bgGlow="group-hover:shadow-emerald-500/20"
          />
          <StatCard
            title="Departments"
            count={departmentCount}
            icon="🏢"
            gradient="from-orange-500 to-amber-500"
            bgGlow="group-hover:shadow-orange-500/20"
          />
        </div>

        {/* Display Order Control */}
        <section className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-lg backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                <span>🎛️</span> Display & Sorting Settings
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Configure how faculty members are ordered on the homepage.
              </p>
            </div>
          </div>
          <AdminDisplayOrderControl
            currentCriteria={currentSortCriteria}
            currentDeptOrder={currentDeptOrder}
            allDepartments={allDeptNames}
          />
        </section>

        {/* Online Users */}
        <section className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-lg backdrop-blur-md">
          <OnlineUsers />
        </section>

        {/* Contact Students */}
        <section className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-lg backdrop-blur-md">
          <AdminContactStudents
            students={allStudents.map((s) => ({
              id: s.id,
              name: s.name,
              nickname: s.nickname,
              studentId: s.studentId,
              email: s.email,
            }))}
          />
        </section>

        {/* Pending Reviews, Faculties & Reports */}
        {(pendingReviews.length > 0 || pendingFaculties.length > 0 || reportedReviews.length > 0) && (
          <section id="pending-actions" className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                ⚡ Pending Moderations
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {pendingReviews.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-amber-200/60 dark:border-amber-900/40 shadow-lg backdrop-blur-md">
                  <AdminReviewControls pendingReviews={pendingReviews as any} />
                </div>
              )}
              {pendingFaculties.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-amber-200/60 dark:border-amber-900/40 shadow-lg backdrop-blur-md">
                  <AdminFacultyControls pendingFaculties={pendingFaculties as any} />
                </div>
              )}
              {reportedReviews.length > 0 && (
                <div className="p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-rose-200/60 dark:border-rose-900/40 shadow-lg backdrop-blur-md lg:col-span-2">
                  <AdminReportControls reportedReviews={reportedReviews as any} />
                </div>
              )}
            </div>
          </section>
        )}

        {/* System Management (Collapsible Sections) */}
        <section className="p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-lg backdrop-blur-md">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>⚙️</span> System Management & Records
            </h2>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Access full student profiles, faculty lists, and department classifications.
            </p>
          </div>

          <AdminDashboardSections
            departments={allDepartments}
            students={allStudents}
            faculties={allFaculties}
          />
        </section>

      </div>
    </div>
  );
}

// Simple & Modern Stat Card Component
function StatCard({ title, count, icon, gradient, bgGlow }: { title: string; count: number; icon: string; gradient: string; bgGlow: string }) {
  return (
    <div className={`group relative p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-md overflow-hidden flex items-center justify-between ${bgGlow}`}>
      <div className="space-y-1">
        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          {count}
        </p>
      </div>

      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
        {icon}
      </div>
    </div>
  );
}