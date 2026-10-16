"use client";
import Link from "next/link";
//import { getServerSession } from "next-auth";
import { useSession, signOut } from "next-auth/react";
//import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";
import AuthButtons from "./AuthButtons";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export default function Navbar() {
  const { data: session } = useSession();
    const pathname = usePathname();
  const myId = session?.user?.id;
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!myId) return;
    const load = async () => {
      try {
        const res = await fetch("/api/messages/unread");
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unread);
        }
      } catch {}
    };
    load();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 30000);
    return () => clearInterval(t);
  }, [myId, pathname]);
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
          
                    {session && (
            <Link
              href="/messages"
              aria-label="Messages"
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-6 h-6 text-gray-700 dark:text-gray-200"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12c0 4.14-4.03 7.5-9 7.5-1.2 0-2.34-.2-3.38-.55L3 20l1.4-3.74C3.53 14.9 3 13.5 3 12c0-4.14 4.03-7.5 9-7.5s9 3.36 9 7.5z"
                />
              </svg>
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}

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