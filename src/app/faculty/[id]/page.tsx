import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import FacultyRatingChart from "@/components/FacultyRatingChart";
import UserBadge from "@/components/UserBadge";
import ReviewForm from "@/components/ReviewForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Metadata } from "next";
import FadeIn from "@/components/FadeIn"; 
import ReviewModalButton from "@/components/ReviewModalButton";
import FollowButton from "@/components/FollowButton";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({
    where: { id },
    select: { name: true, designation: true, department: true }
  });

  if (!faculty) return { title: "Faculty Not Found" };

  const title = `Review of ${faculty.name} | Faculty Review App`;
  const description = `Read honest reviews about ${faculty.name} (${faculty.designation}, ${faculty.department}). 100% Anonymous.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", siteName: "Faculty Review App" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function FacultyProfilePage(props: Props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  
  let isFollowing = false;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { followedFaculties: { where: { id: params.id } } }
    });
    if (user && user.followedFaculties.length > 0) isFollowing = true;
  }

  const faculty = await prisma.faculty.findUnique({
    where: { id: params.id },
    include: {
      reviews: {
        include: {
          user: { 
            select: { id: true, nickname: true, role: true, _count: { select: { reviews: true } } } 
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!faculty) return notFound();

  const totalReviews = faculty.reviews.length;
  const averageRating = totalReviews > 0
      ? (faculty.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-block mb-6 text-indigo-600 dark:text-indigo-400 hover:underline">
          &larr; Back to Faculty List
        </Link>

        <FadeIn className="glass-card rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-md">
                {faculty.name.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {faculty.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      {faculty.designation}  of {faculty.department} Dept.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <FollowButton facultyId={faculty.id} initialIsFollowing={isFollowing} />
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {averageRating} <span className="text-base text-yellow-500">★</span>
                    </span>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Avg Rating</span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="block text-2xl font-bold text-gray-800 dark:text-white">
                      {totalReviews}
                    </span>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Total Reviews</span>
                  </div>
                </div>
              </div>
            </div>
        </FadeIn>

        {/* --- Content Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <FadeIn delay={0.2} className="md:col-span-1 space-y-6">
             <FacultyRatingChart reviews={faculty.reviews} />
             <div className="glass-card p-6 rounded-xl hover:scale-[1.01] transition-transform duration-300">
                <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">💡 Quick Tip</h3>
                <p className="text-sm text-gray-500">
                  Follow this faculty to get notified when new reviews are posted!
                </p>
             </div>
          </FadeIn>

          <div className="md:col-span-2">
            
            <FadeIn delay={0.3} className="mb-8">
              {session ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Have you taken a course?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">Share your experience to help others.</p>
                    <div className="w-full max-w-xs">
                      <ReviewModalButton facultyId={faculty.id} />
                    </div>
                  </div>
              ) : (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg border border-indigo-100 dark:border-indigo-800 text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4 font-medium">Want to share your experience?</p>
                  <Link href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md">
                    Login to Write a Review
                  </Link>
                </div>
              )}
            </FadeIn>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              Student Reviews <span className="text-base font-normal text-gray-500">({totalReviews})</span>
            </h2>

            <div className="space-y-4">
              {faculty.reviews.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 text-lg">No reviews yet. Be the first to review!</p>
                </div>
              ) : (
                faculty.reviews.map((review, index) => (
                  
                  <FadeIn 
                    key={review.id} 
                    delay={index * 0.1} 
                    className="glass-card p-6 rounded-xl hover:scale-[1.01] transition-transform duration-300"
                  >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm">👤</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link href={`/student/${review.user.id}`} className="font-bold text-gray-800 dark:text-white hover:text-indigo-500">
                                  @{review.user?.nickname || "Anonymous"}
                              </Link>
                              <UserBadge reviewCount={review.user?._count?.reviews || 0} role={review.user?.role} />
                            </div>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded text-sm font-bold">
                          ★ {review.rating}
                        </div>
                      </div>

                      <div className="mb-2">
                        <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded">
                          Course: {review.course}
                        </span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {review.comment}
                      </p>
                  </FadeIn>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}