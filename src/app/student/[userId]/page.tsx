// src/app/student/[userId]/page.tsx
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage(props: Props) {
  const params = await props.params;
  const { userId } = params;

  // ১. ইউজারের তথ্য এবং তার দেওয়া রিভিউগুলো আনা
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nickname: true,
      semester: true,
      createdAt: true,
      reviews: {
        where: { status: "APPROVED" }, // শুধুমাত্র অ্যাপ্রুভড রিভিউ দেখাবে
        orderBy: { createdAt: "desc" },
        include: {
          faculty: true,
          votes: true,
        },
      },
    },
  });

  if (!user) {
    return <div className="text-white text-center p-10">Student not found</div>;
  }

  // ২. Reputation Score হিসাব করা
  let reputationScore = 0;
  user.reviews.forEach((review) => {
    const upvotes = review.votes.filter((v) => v.type === "UP").length;
    const downvotes = review.votes.filter((v) => v.type === "DOWN").length;
    reputationScore += (upvotes - downvotes);
  });
  if (reputationScore < 0) reputationScore = 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <a href="/" className="text-indigo-400 hover:underline mb-6 block">← Back to Home</a>

        {/* Profile Card */}
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center border-4 border-gray-900 shadow-xl">
             <span className="text-4xl font-bold">{reputationScore}</span>
             <span className="text-[10px] uppercase tracking-wider opacity-80">Reputation</span>
          </div>

          {/* Info */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">
              {user.nickname ? `@${user.nickname}` : "Anonymous Student"}
            </h1>
            <p className="text-gray-400 text-sm mb-4">
              {user.semester || "Semester info hidden"} • Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <div className="bg-gray-700/50 px-4 py-2 rounded-full inline-block text-sm text-indigo-300 border border-indigo-500/20">
              📝 {user.reviews.length} Reviews Contributed
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <h2 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Recent Reviews</h2>
        <div className="grid gap-4">
          {user.reviews.length === 0 ? (
            <p className="text-gray-500 italic">This student hasn't posted any approved reviews yet.</p>
          ) : (
            user.reviews.map((review) => (
              <div key={review.id} className="bg-gray-800 p-5 rounded-lg border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg text-white">{review.faculty.name}</h3>
                   <span className="text-yellow-400 text-sm">{"★".repeat(review.rating)}</span>
                </div>
                <p className="text-gray-300 text-sm mb-3">"{review.comment}"</p>
                <div className="text-xs text-gray-500 flex gap-4">
                   <span>👍 {review.votes.filter(v => v.type === "UP").length} Upvotes</span>
                   <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}