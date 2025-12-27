"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminReportControls({ reportedReviews }: { reportedReviews: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDismiss = async (reportId: string) => {
    if(loading) return;
    setLoading(true);
    try {
        await fetch(`/api/report/${reportId}`, { method: "DELETE" });
        router.refresh();
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, reportId: string) => {
    if(loading) return;
    setLoading(true);
    try {
        // Review delete logic needs an API endpoint
        await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
        // Also delete the report since resolved
        await fetch(`/api/report/${reportId}`, { method: "DELETE" });
        router.refresh();
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10 col-span-1 lg:col-span-2">
      <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4">
        🚩 Reported Reviews
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {reportedReviews.map((report: any) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                        Reason: {report.reason}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Reported by: {report.user?.nickname || "Anonymous"}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleDismiss(report.id)}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition"
                    >
                        Dismiss
                    </button>
                    <button 
                        onClick={() => handleDeleteReview(report.reviewId, report.id)}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                    >
                        Delete Review
                    </button>
                </div>
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Review for: {report.review?.faculty?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                    "{report.review?.comment}"
                </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}