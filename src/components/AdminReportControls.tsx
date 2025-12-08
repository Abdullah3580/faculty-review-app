"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import AdminReviewDeleteButton from "./AdminReviewDeleteButton"; 

interface Props {
  reviewId: string;
}

export default function AdminReportControls({ reviewId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDismiss = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/report/dismiss", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });

      if (res.ok) {
        toast.success("Report dismissed! Review kept. ✅");
        router.refresh();
      } else {
        toast.error("Failed to dismiss.");
      }
    } catch (error) {
      toast.error("Error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 items-center mt-2">
      <div title="Delete Review & Warn User">
        <AdminReviewDeleteButton reviewId={reviewId} />
      </div>
      
      <button
        onClick={handleDismiss}
        disabled={loading}
        className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded text-gray-700 dark:text-gray-300 font-bold transition"
        title="Ignore report and keep the review"
      >
        {loading ? "..." : "Dismiss Report"}
      </button>
    </div>
  );
}