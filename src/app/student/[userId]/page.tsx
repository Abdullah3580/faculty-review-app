// src/app/student/[userId]/page.tsx
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  // ⚠️ যেহেতু ফোল্ডারের নাম [userId], তাই এখানে userId ব্যবহার করতে হবে
  params: Promise<{ userId: string }>;
}

export default async function StudentProfilePage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  // লগইন না থাকলে লগইন পেজে পাঠাবে
  if (!session) {
    redirect("/login");
  }

  // ১. যার প্রোফাইল দেখা হচ্ছে তার ডাটা আনা
  const profileUser = await prisma.user.findUnique({
    where: { 
      id: params.userId // ✅ এখানে params.userId ব্যবহার করা হয়েছে
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

  // ২. বর্তমানে যে লগইন করে আছে তার রোল এবং আইডি চেক করা
  // আমরা ডাটাবেজ থেকে সরাসরি কারেন্ট ইউজার আনব রোল নিশ্চিত করার জন্য
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user?.email! },
  });

  const isAdmin = currentUser?.role === "ADMIN";
  const isOwnProfile = currentUser?.id === profileUser.id;

  // ✅ সিকিউরিটি লজিক: এডমিন অথবা নিজের প্রোফাইল হলেই সব দেখাবে
  const canViewSensitiveData = isAdmin || isOwnProfile;

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* --- Profile Header Card --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Avatar / Icon */}
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-4xl shadow-inner">
            🤖
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            {/* Nickname (সবার জন্য দৃশ্যমান) */}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              @{profileUser.nickname || "Anonymous"}
            </h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium">
              {profileUser.role}
            </p>
            
            {/* 🔒 Sensitive Data Section */}
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
                  <p><span className="font-semibold text-gray-500">Joined:</span> {new Date(profileUser.createdAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 italic text-sm">
                  <span>🔒 Personal information is hidden.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- User's Reviews --- */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b pb-2">
        Reviews by @{profileUser.nickname}
      </h2>

      <div className="space-y-6">
        {profileUser.reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          profileUser.reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {review.faculty.name}
                </h3>
                <span className="text-yellow-500 font-bold">★ {review.rating}/5</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Course: {review.course}</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {review.comment}
              </p>
              <div className="mt-4 text-xs text-gray-400">
                Posted on {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/" className="text-indigo-600 hover:underline">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}