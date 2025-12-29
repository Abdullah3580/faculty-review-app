//src/components/AdminReviewControls.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReviewControls({ pendingReviews }: { pendingReviews: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleAction = async (id: string, action: "APPROVE" | "REJECT", reason?: string) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/review/action`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reviewId: id, 
          action: action.toLowerCase() ,
          reason: reason
        }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        console.error("Server Error:", data);
        alert("Action failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Network error occurred");
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
                onClick={() => setRejectingId(review.id)}
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
      {/* Reject Modal (পপ-আপ বক্স) */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-lg font-bold text-red-600 mb-2">Reject Review?</h3>
            <textarea 
              className="w-full p-2 border rounded dark:bg-gray-900 dark:text-white"
              rows={3}
              placeholder="Reason (e.g. Bad language)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setRejectingId(null)}
                className="px-3 py-1 bg-gray-200 rounded text-black"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  // এখানে আমরা কারণ (reason) সহ API কল করছি
                  handleAction(rejectingId, "REJECT", rejectReason); 
                  setRejectingId(null);
                  setRejectReason("");
                }}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}