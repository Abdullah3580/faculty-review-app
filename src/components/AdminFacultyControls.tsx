// src/components/AdminFacultyControls.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminFacultyControls({ facultyId }: { facultyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: "approve" | "reject") => {
    setLoading(true);
    await fetch("/api/admin/faculty", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId, action }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2 mt-2">
      <button onClick={() => handleAction("approve")} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-500">
        {loading ? "..." : "Approve Faculty"}
      </button>
      <button onClick={() => handleAction("reject")} disabled={loading} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-500">
        {loading ? "..." : "Reject & Delete"}
      </button>
    </div>
  );
}