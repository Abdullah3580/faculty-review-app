// src/app/profile/page.tsx
import prisma from "@/lib/prisma";
import ProfileEditForm from "@/components/ProfileEditForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProfileDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { faculty: true, votes: true },
      },
    },
  });

  if (!user) return <p>User not found</p>;

  let reputationScore = 0;
  user.reviews.forEach((review) => {
    const upvotes = review.votes.filter((v) => v.type === "UP").length;
    const downvotes = review.votes.filter((v) => v.type === "DOWN").length;
    reputationScore += (upvotes - downvotes);
  });
  if (reputationScore < 0) reputationScore = 0;

  return (
    <div className="min-h-screen p-8"> {/* আগে এখানে bg-gray-900 ছিল, এখন নেই */}
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Welcome back, {user.nickname || user.email}</p>
          </div>
          <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">← Back to Home</Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Reputation Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-lg shadow-lg text-center text-white">
              <h3 className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-2">Reputation Score</h3>
              <div className="text-5xl font-bold mb-1">{reputationScore}</div>
              <p className="text-xs text-indigo-100 opacity-80">Points earned from helpful reviews</p>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
               <ProfileEditForm initialNickname={user.nickname} initialSemester={user.semester} />
            </div>
          </div>

          {/* Right Column: My Reviews */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              My Reviews <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">{user.reviews.length}</span>
            </h2>

            {user.reviews.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg text-center border border-gray-200 dark:border-gray-700 shadow-sm">
                <p className="text-gray-500 mb-4">You haven't written any reviews yet.</p>
                <Link href="/" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 text-sm">Write your first review</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {user.reviews.map((review) => (
                  <div key={review.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{review.faculty.name}</h3>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">{review.faculty.department}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded font-bold ${
                        review.status === "APPROVED" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        review.status === "REJECTED" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}>
                        {review.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <span className="text-yellow-500 dark:text-yellow-400">{"★".repeat(review.rating)}</span>
                      <span className="text-gray-500 text-xs">• {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">"{review.comment}"</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                      <span>👍 {review.votes.filter(v => v.type === "UP").length} Upvotes</span>
                      <span>👎 {review.votes.filter(v => v.type === "DOWN").length} Downvotes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}