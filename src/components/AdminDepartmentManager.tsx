// src/components/AdminDepartmentManager.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AdminDepartmentManager({ departments }: { departments: any[] }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const res = await fetch("/api/admin/department", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);
    if (res.ok) {
      toast.success("Department Added!");
      setName("");
      router.refresh();
    } else {
      toast.error("Failed or already exists!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this department?")) return;
    const res = await fetch("/api/admin/department", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Deleted!");
      router.refresh();
    } else {
      toast.error("Failed!");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Manage Departments</h2>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Dept (e.g. CSE)"
          className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 p-2 rounded text-sm outline-none text-gray-900 dark:text-white"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </form>

      {/* List */}
      <div className="flex flex-wrap gap-2">
        {departments.length === 0 && <p className="text-gray-500 text-sm">No departments added yet.</p>}
        
        {departments.map((dept) => (
          <div key={dept.id} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center gap-2 border border-gray-200 dark:border-gray-600">
            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{dept.name}</span>
            <button 
              onClick={() => handleDelete(dept.id)}
              className="text-red-500 hover:text-red-700 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}