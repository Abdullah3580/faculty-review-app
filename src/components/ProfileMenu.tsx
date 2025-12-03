"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Props {
  user: any;
  isAdmin: boolean;
}

export default function ProfileMenu({ user, isAdmin }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // মেনুর বাইরে ক্লিক করলে বন্ধ হয়ে যাবে
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      
      {/* 1. Profile Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none transition transform hover:scale-105"
      >
        {/* ইউজারের ছবি থাকলে দেখাবে, না থাকলে নামের প্রথম অক্ষর */}
        {user?.image ? (
          <Image
            src={user.image}
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full border-2 border-indigo-500 shadow-md"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white/20 shadow-md">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </button>

      {/* 2. Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-56 glass-card rounded-xl overflow-hidden z-50 p-2 shadow-2xl origin-top-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          >
            
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 mb-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-1">
              
              {/* Compare Button */}
              <Link
                href="/compare"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
              >
                <span>⚖️</span> Compare Faculty
              </Link>

              {/* Edit Profile */}
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition"
              >
                <span>✏️</span> Edit Profile
              </Link>

              {/* ✅ Admin Only Button */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  <span>🛡️</span> Admin Dashboard
                </Link>
              )}

              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

              {/* Logout Button */}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition w-full text-left font-bold"
              >
                <span>🚪</span> Log Out
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}