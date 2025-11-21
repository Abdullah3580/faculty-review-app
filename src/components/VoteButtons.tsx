// src/components/VoteButtons.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoteProps {
  reviewId: string;
  initialVotes: any[]; // সার্ভার থেকে আসা সব ভোটের লিস্ট
  currentUserId?: string; // বর্তমান ইউজার
}

export default function VoteButtons({ reviewId, initialVotes, currentUserId }: VoteProps) {
  const router = useRouter();
  
  // ভোট গণনা করা
  const upvotes = initialVotes.filter((v) => v.type === "UP").length;
  const downvotes = initialVotes.filter((v) => v.type === "DOWN").length;
  
  // আমি কি ভোট দিয়েছি?
  const myVote = initialVotes.find((v) => v.userId === currentUserId)?.type;

  const [loading, setLoading] = useState(false);

  const handleVote = async (type: "UP" | "DOWN") => {
    if (!currentUserId) {
      alert("Please login to vote!");
      return;
    }
    setLoading(true);

    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, type }),
    });

    setLoading(false);
    router.refresh(); // পেজ রিফ্রেশ করে নতুন কাউন্ট দেখাবে
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote("UP")}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition ${
          myVote === "UP" 
            ? "bg-green-600 text-white" 
            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
        }`}
      >
        👍 {upvotes}
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote("DOWN")}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition ${
          myVote === "DOWN" 
            ? "bg-red-600 text-white" 
            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
        }`}
      >
        👎 {downvotes}
      </button>
    </div>
  );
}