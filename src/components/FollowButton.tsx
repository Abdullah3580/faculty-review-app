"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
  facultyId: string;
  initialIsFollowing: boolean;
}

export default function FollowButton({ facultyId, initialIsFollowing }: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/faculty/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        toast.success(data.isFollowing ? "You are now following! 🔔" : "Unfollowed.");
        router.refresh();
      } else {
        toast.error("Need to login first!");
        router.push("/login");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 shadow-sm ${
        isFollowing
          ? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200"
          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md"
      }`}
    >
      {loading ? "..." : isFollowing ? "Following ✓" : "Follow 🔔"}
    </button>
  );
}