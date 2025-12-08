import AdminReviewDeleteButton from "@/components/AdminReviewDeleteButton";
import prisma from "@/lib/prisma";
import AuthButtons from "@/components/AuthButtons";
import AddFacultyForm from "@/components/AddFacultyForm";
import ReviewModalButton from "@/components/ReviewModalButton";
import VoteButtons from "@/components/VoteButtons";
import QASection from "@/components/QASection";
import ReportButton from "@/components/ReportButton";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import UserBadge from "@/components/UserBadge"; 
import NotificationBell from "@/components/NotificationBell"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FadeIn from "@/components/FadeIn";
import SearchBox from "@/components/SearchBox"; 
import ProfileMenu from "@/components/ProfileMenu";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const getTags = (avgRating: number, reviewCount: number) => {
  const tags = [];
  if (reviewCount > 2 && avgRating >= 4.5) tags.push({ label: "💎 Gem", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-200 dark:border-purple-700" });
  else if (reviewCount > 2 && avgRating >= 4.0) tags.push({ label: "❤️ Friendly", color: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border border-green-200 dark:border-green-700" });
  else if (reviewCount > 2 && avgRating <= 2.5) tags.push({ label: "💀 Strict", color: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 border border-red-200 dark:border-red-700" });
  
  if (reviewCount >= 5) tags.push({ label: "🔥 Popular", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-200 dark:border-orange-700" });
  if (reviewCount === 0) tags.push({ label: "🆕 New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-700" });

  return tags;
};

export default async function HomePage(props: Props) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const itemsPerPage = 10;
  const session = await getServerSession(authOptions);

  let isAdmin = false;
  let currentUserId = "";
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    isAdmin = user?.role === "ADMIN";
    currentUserId = user?.id || "";
  }

  const faculties = await prisma.faculty.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { department: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
        { initial: { contains: query, mode: "insensitive" } }
      ],
    },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          user: { 
            select: { 
              id: true, 
              nickname: true, 
              semester: true, 
              role: true, 
              _count: { select: { reviews: true } } 
            } 
          },
          votes: true,
          reports: true
        }
      },
      questions: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, nickname: true, semester: true } },
          answers: {
            orderBy: { createdAt: "asc" },
            include: { user: { select: { id: true, nickname: true, semester: true } } }
          }
        }
      }
    },
  });

  const facultiesWithStats = faculties.map(faculty => {
    const totalRating = faculty.reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgRating = faculty.reviews.length > 0 ? totalRating / faculty.reviews.length : 0;
    const tags = getTags(avgRating, faculty.reviews.length);
    return { ...faculty, avgRating, tags };
  });

  facultiesWithStats.sort((a, b) => b.avgRating - a.avgRating);
  const topFaculties = facultiesWithStats.slice(0, 3);
  
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedFaculties = facultiesWithStats.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      
      <div className="relative overflow-hidden bg-slate-900 text-white pb-24 pt-10 px-4 rounded-b-[2.5rem] shadow-2xl mb-12">
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block py-1.5 px-4 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs md:text-sm font-bold mb-6 uppercase tracking-wider">
            🚀 The #1 Review Platform for Students
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Rate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Faculty Mentors
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Share your honest feedback anonymously, help juniors choose the best courses, and build a transparent community.
          </p>

          <div className="mt-8 mb-4">
            <SearchBox />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-400">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span> 100% Anonymous
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <span className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span> Verified Students
            </div>
          </div>
        </div>
      </div>


      <main className="flex flex-col items-center w-full px-4 md:px-8 max-w-7xl mx-auto">
        
        {page === 1 && !query && topFaculties.length > 0 && topFaculties[0].avgRating > 0 && (
          <div className="w-full mb-16">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">🏆</span> Top Rated Faculties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topFaculties.map((faculty, index) => (
                <div key={faculty.id} className={`p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                  index === 0 
                    ? "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700/50 shadow-lg shadow-yellow-500/10" 
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md"
                }`}>
                  {index === 0 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-white text-[10px] px-3 py-1 font-bold rounded-bl-xl shadow-sm">
                      #1 STUDENT CHOICE
                    </div>
                  )}
                  
                  <Link href={`/faculty/${faculty.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition cursor-pointer mb-2">
                        {faculty.name}
                    </h3>
                  </Link>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {faculty.tags.map((tag, i) => (
                      <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${tag.color}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4"> {faculty.designation}  of {faculty.department} Dept.</p> 
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                    <span className="text-3xl font-black text-gray-800 dark:text-white">{faculty.avgRating.toFixed(1)}</span>
                    <div className="flex flex-col">
                      <div className="flex text-yellow-400 text-sm">
                          {"★".repeat(Math.round(faculty.avgRating))}
                          <span className="text-gray-300 dark:text-gray-600">{"★".repeat(5 - Math.round(faculty.avgRating))}</span>
                      </div>
                      <span className="text-xs text-gray-400">{faculty.reviews.length} Reviews</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session && !query && <AddFacultyForm />}

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {paginatedFaculties.length === 0 ? (
            <div className="col-span-1 lg:col-span-2 text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No faculty found matching "{query}"</p>
              <p className="text-gray-400 mt-2">Try searching by Department.</p>
              {query && <a href="/" className="text-indigo-500 hover:underline mt-4 inline-block font-bold">Clear Search</a>}
            </div>
          ) : (
            paginatedFaculties.map((faculty, index) => (
              <FadeIn 
                key={faculty.id} 
                delay={index * 0.1}
                className="glass-card p-6 md:p-8 rounded-2xl transition-all duration-300 group relative flex flex-col h-full hover:-translate-y-1"
              >
                  <Link href={`/faculty/${faculty.id}`} className="absolute top-6 right-6 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                      View Profile &rarr;
                  </Link>

                  <div className="mb-4 pr-24">
                    <Link href={`/faculty/${faculty.id}`} title={`View profile of ${faculty.name}`} >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 transition cursor-pointer mb-1">
                            {faculty.name}
                        </h2>
                    </Link>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">{faculty.designation}  of {faculty.department} Dept.</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {faculty.tags.map((tag, i) => (
                        <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${tag.color}`}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl mb-6">
                      <span className="text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-wide">
                        Total Reviews: {faculty.reviews.length}
                      </span>
                      {faculty.reviews.length > 0 && (
                        <span className="text-yellow-500 text-base font-black flex items-center gap-1">
                          ★ {faculty.avgRating.toFixed(1)}
                        </span>
                      )}
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2 custom-scrollbar flex-1">
                    {faculty.reviews.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-gray-400 text-sm italic">No reviews yet. Be the first!</p>
                      </div>
                    )}
                    
                    {faculty.reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl text-sm border border-gray-100 dark:border-gray-700/50">
                        <div className="flex flex-wrap justify-between items-start mb-2 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-xs font-bold">{"★".repeat(review.rating)}</span>
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                              {review.course}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Link href={`/student/${review.user.id}`} className="group">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition cursor-pointer">
                                @{review.user.nickname || "Anonymous"} 
                              </span>
                            </Link>
                            <UserBadge reviewCount={review.user._count.reviews} role={review.user.role} />
                          </div>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">
                          {review.comment}
                        </p>
                        
                        <div className="mt-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600/50 pt-2">
                          <VoteButtons reviewId={review.id} initialVotes={review.votes} currentUserId={currentUserId} />

                          {isAdmin ? (
                                    <AdminReviewDeleteButton reviewId={review.id} />
                                  ) : (
                                    <ReportButton reviewId={review.id} />
                                  )}

                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    {session ? (
                      <ReviewModalButton facultyId={faculty.id} />
                    ) : (
                      <Link href="/login" className="w-full mt-4 block text-center bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 font-bold py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-all duration-300">
                        Login to Review
                      </Link>
                    )}
                    
                    <QASection facultyId={faculty.id} questions={faculty.questions} session={session} />
                  </div>

              </FadeIn>
            ))
          )}
        </div>

        <Pagination totalItems={facultiesWithStats.length} itemsPerPage={itemsPerPage} currentPage={page} />
      </main>
    </div>
  );
}