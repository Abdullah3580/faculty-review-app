// src/components/AdminReportControls.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminReportControls({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve_report" | "reject_report") => {
    setLoading(true);
    const res = await fetch("/api/admin/review", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, action }),
    });
    
    setLoading(false);
    if (res.ok) {
        if(action === "approve_report") toast.success("Report Approved. Review Deleted. 🗑️");
        else toast.success("Report Rejected. Review Kept. ✅");
        router.refresh();
    } else {
        toast.error("Failed to update");
    }
  };

  return (
    <div className="flex gap-2 mt-2">
      {/* Approve Report = Delete Review */}
      <button
        onClick={() => handleAction("approve_report")}
        disabled={loading}
        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500 transition font-bold"
        title="This implies the report is TRUE, so the review will be DELETED."
      >
        {loading ? "..." : "Approve Report (Delete Review)"}
      </button>

      {/* Reject Report = Keep Review */}
      <button
        onClick={() => handleAction("reject_report")}
        disabled={loading}
        className="bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-500 transition"
        title="This implies the report is FALSE, so the review will STAY."
      >
        {loading ? "..." : "Reject Report (Keep Review)"}
      </button>
    </div>
  );
}