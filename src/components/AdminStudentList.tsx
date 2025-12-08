
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function AdminStudentList({ students }: { students: any[] }) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  
  const filteredStudents = students.filter(s => 
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId: string) => {
    if (!confirm("⚠️ Are you sure? This will delete the student and ALL their reviews/votes!")) return;
    
    setLoadingId(userId);
    const res = await fetch("/api/admin/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    setLoadingId(null);
    if (res.ok) {
      toast.success("Student deleted/banned!");
      router.refresh();
    } else {
      toast.error("Failed to delete student");
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-indigo-300">Manage Students ({students.length})</h2>
        <input 
          type="text" 
          placeholder="Search email or nickname..." 
          className="bg-gray-900 border border-gray-600 p-2 rounded text-sm text-white w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-900 text-gray-200 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Nickname</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Reviews</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.slice(0, 10).map((student) => ( 
              <tr key={student.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white font-bold">
                  <Link href={`/student/${student.id}`}>
                      @{student.nickname || "Anon"}
                  </Link>
                </td>                 
                <td className="px-4 py-3">{student.email}</td>
                <td className="px-4 py-3">{student.reviews.length}</td>
                <td className="px-4 py-3">{new Date(student.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {student.role !== "ADMIN" && (
                    <button 
                      onClick={() => handleDelete(student.id)}
                      disabled={loadingId === student.id}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-500"
                    >
                      {loadingId === student.id ? "..." : "Delete"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && <p className="text-center py-4">No students found.</p>}
      </div>
    </div>
  );
}