"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminFacultyControls({ pendingFaculties }: { pendingFaculties: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/faculty/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl border border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10">
      <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-4">
        👨‍🏫 Pending Faculty Requests
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {pendingFaculties.map((faculty: any) => (
          <div key={faculty.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm gap-4">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">{faculty.name}</p>
              <p className="text-xs text-gray-500">Initial: {faculty.initial}</p>
              <p className="text-xs text-gray-400">ID: {faculty.id}</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleAction(faculty.id, "approve")}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleAction(faculty.id, "reject")}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}