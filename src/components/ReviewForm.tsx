// src/components/ReviewForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReviewForm({ facultyId }: { facultyId: string }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [course, setCourse] = useState(""); // নতুন স্টেট
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        facultyId, 
        rating, 
        comment, 
        course: course.toUpperCase() // কোর্স কোড সবসময় বড় হাতের হবে (যেমন: CSE101)
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setComment("");
      setCourse("");
      setIsOpen(false);
      router.refresh();
      toast.success("Review submitted for Admin approval! 🛡️");
    } else {
      toast.error(data.error || "Something went wrong");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 text-sm text-indigo-400 hover:underline font-medium"
      >
        ✍️ Write a Review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-gray-900 p-5 rounded-lg border border-gray-700 shadow-lg">
      <h3 className="text-white font-bold mb-3">Rate this Faculty</h3>
      
      {/* কোর্স ইনপুট (নতুন) */}
      <div className="mb-3">
        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wide">Course Name</label>
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="e.g. CSE101, PHY102"
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-500 outline-none text-sm"
          required
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wide">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-500 outline-none text-sm"
        >
          <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
          <option value="4">⭐⭐⭐⭐ (Good)</option>
          <option value="3">⭐⭐⭐ (Average)</option>
          <option value="2">⭐⭐ (Poor)</option>
          <option value="1">⭐ (Terrible)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wide">Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-indigo-500 outline-none text-sm"
          rows={3}
          required
          placeholder="Share your experience..."
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm hover:bg-indigo-500 font-medium"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 px-3 py-1.5 rounded text-sm hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}