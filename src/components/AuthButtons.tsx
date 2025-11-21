// src/components/AuthButtons.tsx
"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-gray-400 text-sm">Loading...</p>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-6">
        {/* ১. Edit Profile লিংক (এখানে নিশ্চিতভাবে দেখাবে) */}
        <Link 
          href="/profile" 
          className="text-sm text-indigo-300 hover:text-white transition underline underline-offset-4"
        >
          Edit Profile
        </Link>

        <div className="flex items-center gap-3">
          {/* ২. ইউজারের ইমেল বা নাম */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm text-white font-medium">
              {session.user?.email?.split('@')[0]}
            </p>
          </div>

          {/* ৩. লগআউট বাটন */}
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
    >
      Log In
    </button>
  );
}