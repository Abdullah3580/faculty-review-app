"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props { 
  reviewId: string;
}

export default function AdminReviewControls({ pendingReviews }: { pendingReviews: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ এখানে টাইপ পরিবর্তন করা হলো (ছোট হাতের অক্ষরে)
  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/review/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ ছোট হাতের অক্ষর পাঠানো হচ্ছে, যা ব্যাকএন্ডের সাথে মিলবে
        body: JSON.stringify({ reviewId, action }),
      });

      if (res.ok) {
        toast.success(action === "approve" ? "Review Approved! ✅" : "Review Rejected! ❌");
        
        // পেজ রিফ্রেশ করে নতুন ডাটা আনবে
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
        // ✅ এখানে লক্ষ্য করুন: "approve" (ছোট হাতের)
        onClick={() => handleAction("approve")}
        disabled={loading}
        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs font-bold transition"
        title="Approve Review"
      >
        {loading ? "..." : "✅ Approve"}
      </button>
      
      <button
        // ✅ এখানে লক্ষ্য করুন: "reject" (ছোট হাতের)
        onClick={() => handleAction("reject")}
        disabled={loading}
        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-bold transition"
        title="Reject & Delete"
      >
        {loading ? "..." : "❌ Reject"}
      </button>
    </div>
  );
}