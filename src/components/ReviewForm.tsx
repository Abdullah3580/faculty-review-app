"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  facultyId: string;
}

export default function ReviewForm({ facultyId }: Props) {
  const [rating, setRating] = useState(0);
  const [course, setCourse] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ডেটাবেজ থেকে আসা কোর্সগুলো রাখার জন্য স্টেট
  const [courses, setCourses] = useState<string[]>([]);
  
  // ড্রপডাউনের জন্য নতুন স্টেট
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  // কম্পোনেন্ট লোড হওয়ার সময় ডেটাবেজ (API) থেকে কোর্স লিস্ট ফেচ করা
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses");
        if (res.ok) {
          const data = await res.json();
          // API থেকে যদি স্ট্রিংয়ের অ্যারে আসে, তবে সেটি স্টেটে সেভ করবে
          if (Array.isArray(data)) {
            setCourses(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // ড্রপডাউনের বাইরে ক্লিক করলে সেটি বন্ধ করার লজিক
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ইউজার যা টাইপ করবে তার ভিত্তিতে ডেটাবেজ থেকে পাওয়া কোর্স ফিল্টার করা
  const filteredCourses = courses.filter(c => 
    c.toLowerCase().includes(course.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please give a rating ⭐");
      return;
    }

    // ভ্যালিডেশন: টাইপ করা কোর্সটি অবশ্যই ডেটাবেজের লিস্টে থাকতে হবে
    if (!courses.includes(course)) {
      toast.error("Please select a valid course from the list 📚");
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
        setIsDropdownOpen(false); // সাবমিট করার পর ড্রপডাউন বন্ধ
        router.refresh();
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
    <form onSubmit={handleSubmit} className="space-y-4 relative">
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

      {/* Course Search Box */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
          Course Taken (e.g. CSE101 or Physics)
        </label>
        <input
          type="text"
          value={course}
          onChange={(e) => {
            setCourse(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder="Search course code..."
          className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:border-indigo-500 outline-none transition"
          required
          autoComplete="off"
        />
        
        {/* Dropdown Menu */}
        {isDropdownOpen && filteredCourses.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto custom-scrollbar">
            {filteredCourses.map((c) => (
              <li
                key={c}
                className="p-3 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer text-gray-700 dark:text-gray-300 transition border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onClick={() => {
                  setCourse(c); // সিলেক্ট করলে ইনপুটে পুরো নাম বসবে
                  setIsDropdownOpen(false); // ড্রপডাউন বন্ধ হবে
                }}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

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