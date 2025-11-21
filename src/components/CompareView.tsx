// src/components/CompareView.tsx
"use client";

import { useState } from "react";

interface Faculty {
  id: string; name: string; department: string; reviews: { rating: number }[];
}

export default function CompareView({ faculties }: { faculties: Faculty[] }) {
  const [selected1, setSelected1] = useState<string>("");
  const [selected2, setSelected2] = useState<string>("");

  const getFacultyStats = (id: string) => {
    const faculty = faculties.find((f) => f.id === id);
    if (!faculty) return null;
    const totalReviews = faculty.reviews.length;
    const totalRating = faculty.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : "N/A";
    return { ...faculty, totalReviews, avgRating };
  };

  const f1 = getFacultyStats(selected1);
  const f2 = getFacultyStats(selected2);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">
        Compare Faculty Members
      </h2>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Select Faculty 1</label>
          <select value={selected1} onChange={(e) => setSelected1(e.target.value)} className="w-full p-3 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none">
            <option value="">-- Select --</option>
            {faculties.map((f) => (<option key={f.id} value={f.id} disabled={f.id === selected2}>{f.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Select Faculty 2</label>
          <select value={selected2} onChange={(e) => setSelected2(e.target.value)} className="w-full p-3 rounded bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white outline-none">
            <option value="">-- Select --</option>
            {faculties.map((f) => (<option key={f.id} value={f.id} disabled={f.id === selected1}>{f.name}</option>))}
          </select>
        </div>
      </div>

      {f1 && f2 ? (
        <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-col gap-6 text-right font-bold text-gray-500 dark:text-gray-400 py-2">
            <div>Name</div><div>Department</div><div>Avg Rating</div><div>Total Reviews</div><div>Rec</div>
          </div>
          <div className="flex flex-col gap-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg py-2 border border-indigo-200 dark:border-indigo-500/30">
            <div className="font-bold text-gray-900 dark:text-white">{f1.name}</div>
            <div className="text-gray-600 dark:text-gray-300">{f1.department}</div>
            <div className="text-yellow-500 dark:text-yellow-400 font-bold text-xl">★ {f1.avgRating}</div>
            <div className="text-gray-600 dark:text-gray-300">{f1.totalReviews}</div>
            <div className="text-xs text-gray-500">{Number(f1.avgRating) > Number(f2.avgRating) ? "🔥 Higher Rated" : "-"}</div>
          </div>
          <div className="flex flex-col gap-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg py-2 border border-cyan-200 dark:border-cyan-500/30">
            <div className="font-bold text-gray-900 dark:text-white">{f2.name}</div>
            <div className="text-gray-600 dark:text-gray-300">{f2.department}</div>
            <div className="text-yellow-500 dark:text-yellow-400 font-bold text-xl">★ {f2.avgRating}</div>
            <div className="text-gray-600 dark:text-gray-300">{f2.totalReviews}</div>
            <div className="text-xs text-gray-500">{Number(f2.avgRating) > Number(f1.avgRating) ? "🔥 Higher Rated" : "-"}</div>
          </div>
        </div>
      ) : <div className="text-center text-gray-500 py-8">Please select two faculty members.</div>}
    </div>
  );
}