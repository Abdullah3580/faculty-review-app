"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useTheme } from "next-themes";

interface Props {
  user: any;
  isAdmin: boolean;
  unread?: number;
}

export default function ProfileMenu({ user, isAdmin, unread = 0 }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  // মেনুর বাইরে ক্লিক করলে বন্ধ হওয়ার লজিক
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // কমন মেনু আইটেম স্টাইল (যাতে বারবার ক্লাস লিখতে না হয়)
  const menuItemClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors rounded-lg mx-1 my-0.5";

  return (
    <div className="relative" ref={menuRef}>
      {/* প্রোফাইল বাটন / অ্যাভাতার */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 focus:outline-none transition transform hover:scale-105 active:scale-95"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-indigo-500 shadow-md object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-md">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        
      </button>

      {/* ড্রপডাউন মেনু */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 origin-top-right ring-1 ring-black ring-opacity-5"
          >
            {/* ইউজারের নাম ও ইমেইল */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {user?.email}
              </p>
            </div>

            <div className="py-2 flex flex-col">
              {/* সবার জন্য দৃশ্যমান */}
              <Link
                href="/compare"
                onClick={() => setIsOpen(false)}
                className={menuItemClass}
              >
                <span className="text-lg">⚖️</span> Compare Faculty
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className={menuItemClass}
              >
                <span className="text-lg">✏️</span> Edit Profile
              </Link>
              {/* <Link
                href="/messages"
                onClick={() => setIsOpen(false)}
                className={menuItemClass}
              >
                <span className="text-lg">💬</span> Messages
                {unread > 0 && (
                  <span className="ml-auto text-[10px] bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">
                    {unread}
                  </span>
                )}
              </Link> */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`${menuItemClass} text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800`}
                >
                  <span className="text-lg">🛡️</span> Admin Dashboard
                </Link>
              )}

              {/* থিম টগল বাটন */}
              <button
                onClick={toggleTheme}
                className={`${menuItemClass} justify-between w-full`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">
                    {theme === "dark" ? "🌙" : "☀️"}
                  </span>
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
                {/* টগল সুইচ ডিজাইন */}
                <div
                  className={`w-9 h-5 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 duration-300 ${theme === "dark" ? "bg-indigo-500" : ""}`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform duration-300 ${theme === "dark" ? "translate-x-4" : ""}`}
                  ></div>
                </div>
              </button>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2"></div>

              {/* লগআউট বাটন */}
              <button
                onClick={() => signOut()}
                className={`${menuItemClass} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20`}
              >
                <span className="text-lg">🚪</span> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
