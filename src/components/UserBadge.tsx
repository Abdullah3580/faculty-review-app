"use client";

interface Props {
  reviewCount: number;
  role?: string;
}

export default function UserBadge({ reviewCount, role }: Props) {
  
  if (role === "ADMIN") {
    return (
      <span className="bg-red-100 text-red-700 border border-red-200 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
        🛡️ Admin
      </span>
    );
  }

  
  if (reviewCount >= 10) {
    return (
      <span className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
        🥇 Master Critic
      </span>
    );
  } 
  
  if (reviewCount >= 5) {
    return (
      <span className="bg-gray-100 text-gray-700 border border-gray-300 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
        🥈 Pro Reviewer
      </span>
    );
  } 
  
  if (reviewCount >= 1) {
    return (
      <span className="bg-orange-50 text-orange-700 border border-orange-200 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
        🥉 Contributor
      </span>
    );
  }

  
  return (
    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full font-medium">
      🐣 Newbie
    </span>
  );
}