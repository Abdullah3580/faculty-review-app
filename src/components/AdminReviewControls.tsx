"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// টাইপ ফিক্স: pendingReviews array গ্রহণ করবে
export default function AdminReviewControls({ pendingReviews }: { pendingReviews: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (loading) return;
    setLoading(true);

    try {
      // আমরা এখানে ধরে নিচ্ছি আপনার API টি '/api/admin/review' বা এমন কোনো পাথে আছে যা বডিতে ID আশা করে
      // অথবা যদি ডাইনামিক রাউট হয়, তবুও বডি ফিক্স করা হলো:
      const res = await fetch(`/api/admin/review`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // ⚠️ ফিক্স: আগে ছিল { reviewId, action }, এখন করা হলো { reviewId: id, action }
        body: JSON.stringify({ reviewId: id, action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        // যদি উপরের API পাথ কাজ না করে, তবে অনেক সময় ডাইনামিক পাথেও কাজ হতে পারে, যেমন:
        // await fetch(`/api/review/${id}`, { method: "PATCH", body: JSON.stringify({ action }) });
        console.error("Action failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10">
      <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-4">
        📝 Pending Reviews
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {pendingReviews.map((review: any) => (
          <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-200">
                  {review.faculty?.name || "Unknown Faculty"}
                </p>
                <p className="text-xs text-gray-500">
                  By: {review.user?.nickname || "Anonymous"}
                </p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-700">
              "{review.comment}"
            </p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleAction(review.id, "APPROVE")}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(review.id, "REJECT")}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {pendingReviews.length === 0 && (
          <p className="text-center text-gray-500 py-4">No pending reviews</p>
        )}
      </div>
    </div>
  );
}