"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  reviewId: string;
}

export default function AdminReviewDeleteButton({ reviewId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const router = useRouter();

  
  const handleDelete = async (withWarning: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/review/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reviewId, 
          withWarning, 
          warningReason: withWarning ? warningReason : null 
        }),
      });

      if (res.ok) {
        toast.success(withWarning ? "Deleted & User Warned! ⚠️" : "Review Deleted! 🗑️");
        setIsOpen(false);
        router.refresh(); 
      } else {
        toast.error("Failed to delete.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-red-500 transition p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
        title="Delete Review (Admin)"
      >
        🗑️
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 animation-fade-in-up">
            
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Review?</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              This action cannot be undone. How would you like to proceed?
            </p>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase">Warning Reason (Optional)</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 outline-none focus:border-red-500"
                rows={2}
                placeholder="e.g. Inappropriate language used..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              
              <button
                onClick={() => handleDelete(true)}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "⚠️ Delete & Warn User"}
              </button>

              <button
                onClick={() => handleDelete(false)}
                disabled={loading}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-semibold text-sm transition"
              >
                Just Delete Review
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 text-sm underline"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}