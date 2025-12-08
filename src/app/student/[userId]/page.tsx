// src/app/student/[userId]/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import UserBadge from "@/components/UserBadge"; 

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function StudentProfilePage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const profileUser = await prisma.user.findUnique({
    where: { 
      id: params.userId 
    }, 
    include: {
      reviews: {
        include: {
          faculty: true,
          votes: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profileUser) {
    return notFound();
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });

  const isAdmin = currentUser?.role === "ADMIN";
  const isOwnProfile = currentUser?.id === profileUser.id;
  const canViewSensitiveData = isAdmin || isOwnProfile;

  const reviewCount = profileUser.reviews.length;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white dark:border-gray-700">
            🤖
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            
            <div className="flex flex-col md:flex-row items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                @{profileUser.nickname || "Anonymous"}
              </h1>
              <UserBadge reviewCount={reviewCount} role={profileUser.role} />
            </div>

            <p className="text-indigo-600 dark:text-indigo-400 font-medium">
              {profileUser.role} &bull; Joined {new Date(profileUser.createdAt).toLocaleDateString()}
            </p>
            
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              {canViewSensitiveData ? (
                <div className="space-y-2 text-sm">
                  {isAdmin && (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded mb-2 inline-block">
                      ADMIN VIEW
                    </span>
                  )}
                  <p><span className="font-semibold text-gray-500">Full Name:</span> {profileUser.name}</p>
                  <p><span className="font-semibold text-gray-500">Student ID:</span> {profileUser.studentId}</p>
                  <p><span className="font-semibold text-gray-500">Email:</span> {profileUser.email}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 italic text-sm justify-center md:justify-start">
                  <span>🔒 Personal information is hidden.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Reviews History
        </h2>
        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold">
          Total: {reviewCount}
        </span>
      </div>

      <div className="space-y-6">
        {profileUser.reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500">This user hasn't posted any reviews yet.</p>
          </div>
        ) : (
          profileUser.reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/faculty/${review.facultyId}`} className="hover:underline">
                  <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {review.faculty.name}
                  </h3>
                </Link>
                <span className="text-yellow-500 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded text-sm">
                  ★ {review.rating}/5
                </span>
              </div>
              
              <div className="mb-3">
                 <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                    Course: {review.course}
                 </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {review.comment}
              </p>
              
              <div className="mt-4 text-xs text-gray-400 border-t pt-3 dark:border-gray-700">
                Posted on {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-indigo-600 hover:underline font-medium">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}