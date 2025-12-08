// src/components/AdminFacultyList.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminFacultyList({ faculties }: { faculties: any[] }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const filteredFaculties = faculties.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (facultyId: string) => {
    if (!confirm("⚠️ Warning! This will delete the faculty and ALL reviews associated with them.")) return;
    
    setLoadingId(facultyId);
    const res = await fetch("/api/admin/faculty", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId, action: "reject" }),
    });

    setLoadingId(null);
    if (res.ok) {
      toast.success("Faculty deleted!");
      router.refresh();
    } else {
      toast.error("Failed to delete faculty");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-300">Manage Faculties ({faculties.length})</h2>
        <input 
          type="text" 
          placeholder="Search faculty..." 
          className="bg-gray-900 border border-gray-600 p-2 rounded text-sm text-white w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-2 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredFaculties.map((faculty) => (
          <div key={faculty.id} className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-700 hover:bg-gray-700/50">
            <div>
              <Link href={`/faculty/${faculty.id}`}>
              <h3 className="font-bold text-white">{faculty.name}</h3>
            </Link>



              <p className="text-xs text-gray-400">{faculty.department} • {faculty.reviews.length} Reviews</p>
            </div>
            <button 
              onClick={() => handleDelete(faculty.id)}
              disabled={loadingId === faculty.id}
              className="bg-red-900/50 text-red-200 border border-red-800 px-3 py-1 rounded text-xs hover:bg-red-800 transition"
            >
              {loadingId === faculty.id ? "..." : "Delete"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}