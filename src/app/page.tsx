// src/app/page.tsx
import prisma from "@/lib/prisma";
import AuthButtons from "@/components/AuthButtons";
import AddFacultyForm from "@/components/AddFacultyForm";
import ReviewForm from "@/components/ReviewForm";
import SearchBox from "@/components/SearchBox";
import VoteButtons from "@/components/VoteButtons";
import QASection from "@/components/QASection";
import ReportButton from "@/components/ReportButton";
import Pagination from "@/components/Pagination";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

const getTags = (avgRating: number, reviewCount: number) => {
  const tags = [];
  if (reviewCount > 2 && avgRating >= 4.5) tags.push({ label: "💎 Gem", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" });
  else if (reviewCount > 2 && avgRating >= 4.0) tags.push({ label: "❤️ Friendly", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" });
  else if (reviewCount > 2 && avgRating <= 2.5) tags.push({ label: "💀 Strict", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" });
  
  if (reviewCount >= 5) tags.push({ label: "🔥 Popular", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" });
  if (reviewCount === 0) tags.push({ label: "🆕 New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" });

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
        { department: { contains: query, mode: "insensitive" } }
      ],
    },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, nickname: true, semester: true } },
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
    <div className="min-h-screen p-8">
      {/* --- Header (Updated) --- */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 max-w-6xl mx-auto border-b border-gray-200 dark:border-gray-800 pb-6 gap-6">
        
        {/* 1. Logo / Title */}
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 shrink-0">
          Faculty Review
        </h1>
        
        {/* 2. Search Box (এখন মাঝখানে) */}
        <div className="w-full md:max-w-md mx-auto order-3 md:order-2">
           <SearchBox />
        </div>

        {/* 3. Action Buttons */}
        <div className="flex items-center gap-4 order-2 md:order-3 shrink-0">
           <ThemeSwitcher />
           
           <a href="/compare" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white text-sm font-medium border border-gray-300 dark:border-gray-600 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
             ⚖️ Compare
           </a>
           {isAdmin && (
             <a href="/admin" className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-500">
               Admin
             </a>
           )}
           <AuthButtons />
        </div>
      </header>
      {/* ------------------------ */}

      <main className="flex flex-col items-center w-full">
        
        {/* Leaderboard */}
        {page === 1 && !query && topFaculties.length > 0 && topFaculties[0].avgRating > 0 && (
          <div className="w-full max-w-6xl mb-12">
            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center gap-2">
              🏆 Top Rated Faculty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topFaculties.map((faculty, index) => (
                <div key={faculty.id} className={`p-4 rounded-lg border relative overflow-hidden shadow-sm ${
                  index === 0 
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-500/50" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                }`}>
                  {index === 0 && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-2 py-1 font-bold">#1 Choice</div>}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{faculty.name}</h3>
                  
                  <div className="flex flex-wrap gap-1 mt-1 mb-2">
                    {faculty.tags.map((tag, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${tag.color}`}>
                        {tag.label}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400">{faculty.department}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{faculty.avgRating.toFixed(1)}</span>
                    <div className="flex text-yellow-500 dark:text-yellow-400 text-sm">
                       {"★".repeat(Math.round(faculty.avgRating))}
                       <span className="text-gray-300 dark:text-gray-600">{"★".repeat(5 - Math.round(faculty.avgRating))}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {session && !query && <AddFacultyForm />}

        {/* Faculty List */}
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedFaculties.length === 0 ? (
            <div className="col-span-2 text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 text-xl">No faculty found matching "{query}"</p>
              {query && <a href="/" className="text-indigo-500 dark:text-indigo-400 hover:underline mt-2 block">Clear Search</a>}
            </div>
          ) : (
            paginatedFaculties.map((faculty) => (
              <div key={faculty.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-500/30 transition shadow-lg">
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{faculty.name}</h2>
                    <div className="flex flex-wrap gap-2 mt-2 mb-1">
                      {faculty.tags.map((tag, i) => (
                        <span key={i} className={`text-xs px-2 py-1 rounded font-medium ${tag.color}`}>
                          {tag.label}
                        </span>
                      ))}
                    </div>
                    <p className="text-indigo-600 dark:text-indigo-300 text-sm font-medium mt-1">{faculty.department}</p>
                  </div>
                  <div className="text-right">
                     <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded block mb-1">
                      {faculty.reviews.length} Reviews
                    </span>
                    {faculty.reviews.length > 0 && (
                      <span className="text-yellow-500 dark:text-yellow-400 text-sm font-bold">
                        ★ {faculty.avgRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-4 max-h-60 overflow-y-auto mb-4 pr-2 custom-scrollbar mt-4">
                  {faculty.reviews.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No reviews yet.</p>
                  )}
                  
                  {faculty.reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 dark:text-yellow-400 text-xs">{"★".repeat(review.rating)}</span>
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                            {review.course}
                          </span>
                        </div>
                        <Link href={`/student/${review.user.id}`} className="group">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition cursor-pointer">
                            {review.user.nickname ? `@${review.user.nickname}` : "Anonymous"} 
                          </span>
                        </Link>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-200 mt-1 leading-relaxed">{review.comment}</p>
                      
                      <VoteButtons reviewId={review.id} initialVotes={review.votes} currentUserId={currentUserId} />
                      <ReportButton reviewId={review.id} />
                    </div>
                  ))}
                </div>

                {session && <ReviewForm facultyId={faculty.id} />}
                <QASection facultyId={faculty.id} questions={faculty.questions} session={session} />

              </div>
            ))
          )}
        </div>

        <Pagination totalItems={facultiesWithStats.length} itemsPerPage={itemsPerPage} currentPage={page} />
      </main>
    </div>
  );
}