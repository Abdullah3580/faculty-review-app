import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import AuthButtons from "./AuthButtons";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  
  const userRole = session?.user?.role; 
  const isAdmin = userRole === "admin" || userRole === "ADMIN";

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-lg bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition duration-300">🎓</span> 
          <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
            Faculty<span className="text-indigo-600 dark:text-indigo-400">Review</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          
          {session && <NotificationBell />}

          {session?.user ? (
            <ProfileMenu user={session.user} isAdmin={isAdmin} />
          ) : (
            <AuthButtons />
          )}
        </div>

      </div>
    </nav>
  );
}