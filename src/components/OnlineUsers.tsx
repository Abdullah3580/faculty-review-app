"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface OnlineUser {
  id: string;
  nickname: string | null;
  email: string | null;
  role: string;
  lastSeen: string;
}

export default function OnlineUsers() {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch("/api/admin/online-users");
      const data = await res.json();
      setUsers(data);
    } catch {
      console.error("Failed to fetch online users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    // প্রতি ৩০ সেকেন্ডে আপডেট
    const interval = setInterval(fetchOnlineUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block"></span>
          Online Users
          <span className="text-sm font-normal text-gray-500">
            (last 5 min)
          </span>
        </h3>
        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold px-3 py-1 rounded-full">
          {users.length} online
        </span>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users online right now.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {user.nickname?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <Link
                    href={`/student/${user.id}`}
                    className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 text-sm"
                  >
                    @{user.nickname || "Anonymous"}
                  </Link>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  user.role === "ADMIN"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
                }`}>
                  {user.role}
                </span>
                <p className="text-xs text-gray-400 mt-1">
                  {getTimeAgo(user.lastSeen)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}