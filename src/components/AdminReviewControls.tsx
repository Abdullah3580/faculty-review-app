"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  reviewId: string;
}

export default function AdminReviewControls({ reviewId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    setLoading(true);
    try {
      // ✅ আপডেট: সঠিক API রুটে কল করা হচ্ছে
      const res = await fetch("/api/admin/review/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });

      if (res.ok) {
        toast.success(action === "APPROVE" ? "Review Approved! ✅" : "Review Rejected! ❌");
        router.refresh();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={loading}
        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs font-bold transition"
        title="Approve Review"
      >
        {loading ? "..." : "✅ Approve"}
      </button>
      <button
        onClick={() => handleAction("REJECT")}
        disabled={loading}
        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-bold transition"
        title="Reject & Delete"
      >
        {loading ? "..." : "❌ Reject"}
      </button>
    </div>
  );
}