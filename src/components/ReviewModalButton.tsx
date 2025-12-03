"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewForm from "./ReviewForm";

interface Props {
  facultyId: string;
}

export default function ReviewModalButton({ facultyId }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ১. বাটন (যা কার্ডের নিচে থাকবে) */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 font-bold py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
      >
        <span>✍️</span> Write a Review
      </button>

      {/* ২. পপ-আপ মডাল */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            
            {/* ব্যাকগ্রাউন্ড ব্লার (Backdrop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)} // বাইরে ক্লিক করলে বন্ধ হবে
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* মডাল কন্টেন্ট */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              
              {/* মডাল হেডার */}
              <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Submit Your Review
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              {/* রিভিউ ফর্ম */}
              <div className="p-6">
                 {/* ফর্ম সাবমিট হওয়ার পর অটোমেটিক বন্ধ হওয়ার জন্য আমরা setIsOpen(false) পাঠাতে পারি, 
                     তবে আপাতত সিম্পল রাখছি */}
                 <ReviewForm facultyId={facultyId} />
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}