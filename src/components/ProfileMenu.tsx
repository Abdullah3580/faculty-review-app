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
}

export default function ProfileMenu({ user, isAdmin }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme(); 
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

  return (
    <div className="relative" ref={menuRef}>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none transition transform hover:scale-105"
      >
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-60 glass-card rounded-xl overflow-hidden z-50 p-2 shadow-2xl origin-top-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          >
            
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 mb-2">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>

            <div className="flex flex-col gap-1">
              
              <Link href="/compare" onClick={() => setIsOpen(false)} className="menu-item">
                <span>⚖️</span> Compare Faculty
              </Link>

              <Link href="/profile" onClick={() => setIsOpen(false)} className="menu-item">
                <span>✏️</span> Edit Profile
              </Link>

              {isAdmin && (
                <Link href="/admin" onClick={() => setIsOpen(false)} className="menu-item text-red-600 dark:text-red-400">
                  <span>🛡️</span> Admin Dashboard
                </Link>
              )}

              <button onClick={toggleTheme} className="menu-item justify-between w-full">
                <span className="flex items-center gap-3">
                  <span>{theme === 'dark' ? '🌙' : '☀️'}</span> 
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <div className={`w-8 h-4 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 duration-300 ${theme === 'dark' ? 'justify-end bg-indigo-500' : ''}`}>
                  <div className="bg-white w-3 h-3 rounded-full shadow-md transform duration-300"></div>
                </div>
              </button>

              <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>

              <button onClick={() => signOut()} className="menu-item text-red-600 dark:text-red-400 w-full text-left">
                <span>🚪</span> Log Out
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}