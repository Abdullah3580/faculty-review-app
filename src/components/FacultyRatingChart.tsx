//src/components ফোল্ডারে FacultyRatingChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  reviews: { rating: number }[];
}

export default function FacultyRatingChart({ reviews }: Props) {
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    // @ts-ignore
    if (ratingCounts[review.rating] !== undefined) {
      // @ts-ignore
      ratingCounts[review.rating] += 1;
    }
  });

  const data = [
    { name: "5 ★", count: ratingCounts[5], color: "#22c55e" }, 
    { name: "4 ★", count: ratingCounts[4], color: "#84cc16" },
    { name: "3 ★", count: ratingCounts[3], color: "#eab308" }, 
    { name: "2 ★", count: ratingCounts[2], color: "#f97316" },
    { name: "1 ★", count: ratingCounts[1], color: "#ef4444" }, 
  ];

  if (reviews.length === 0) {
    return <p className="text-sm text-gray-500 italic">No rating data available.</p>;
  }

  return (
    <div className="w-full h-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
        📊 Rating Distribution
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }} 
            width={30}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}