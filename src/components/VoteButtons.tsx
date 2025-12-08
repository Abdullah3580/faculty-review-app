
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VoteProps {
  reviewId: string;
  initialVotes: any[]; 
  currentUserId?: string; 
}

export default function VoteButtons({ reviewId, initialVotes, currentUserId }: VoteProps) {
  const router = useRouter();
  
  
  const upvotes = initialVotes.filter((v) => v.type === "UP").length;
  const downvotes = initialVotes.filter((v) => v.type === "DOWN").length;
  
  
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
    router.refresh(); 
  };

  return (
    <div className="flex items-center gap-2 mt-2">
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