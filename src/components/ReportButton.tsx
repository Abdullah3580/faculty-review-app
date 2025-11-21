// src/components/ReportButton.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ReportButton({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!confirm("Are you sure you want to report this review as inappropriate?")) return;
    
    setLoading(true);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, reason: "Inappropriate Content" }),
    });

    setLoading(false);
    if (res.ok) {
      toast.success("Report submitted! Admin will review it.");
    } else {
      toast.error("Failed to report. Try again.");
    }
  };

  return (
    <button 
      onClick={handleReport} 
      disabled={loading}
      className="text-[10px] text-gray-500 hover:text-red-400 flex items-center gap-1 mt-2"
    >
      🚩 Report
    </button>
  );
}