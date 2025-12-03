"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  facultyId: string;
}

export default function ReviewForm({ facultyId }: Props) {
  // ❌ আগের isExpanded বা isOpen স্টেটটি মুছে ফেলা হলো
  const [rating, setRating] = useState(0);
  const [course, setCourse] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please give a rating ⭐");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, rating, course, comment }),
      });

      if (res.ok) {
        toast.success("Review submitted for approval! 🎉");
        setRating(0);
        setCourse("");
        setComment("");
        router.refresh();
        
        // ফর্ম সাবমিট হলে পেজ রিলোড বা মডাল বন্ধের লজিক প্যারেন্ট হ্যান্ডেল করবে
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to submit.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ❌ আগে এখানে বাটন ছিল, এখন সরাসরি ফর্ম রিটার্ন করবে
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* 1. Star Rating */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition transform hover:scale-110 ${
                star <= rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* 2. Course Name */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          Course Taken (e.g. CSE101)
        </label>
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Enter course code"
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none transition"
          required
        />
      </div>

      {/* 3. Comment */}
      <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your honest experience..."
          rows={4}
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none transition"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>

    </form>
  );
}