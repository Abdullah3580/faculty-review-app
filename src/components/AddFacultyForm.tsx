// src/components/AddFacultyForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddFacultyForm() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ১. পেজ লোড হলে ডিপার্টমেন্ট লিস্ট নিয়ে আসা
  useEffect(() => {
    fetch("/api/department")
      .then((res) => res.json())
      .then((data) => setDepartments(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, department }),
      });

      const data = await res.json();

      if (res.ok) {
        setName("");
        setDepartment("");
        router.refresh();
        toast.success("Request sent! Faculty will appear after Admin approval. 🛡️");
      } else {
        toast.error(data.error || "Failed to add faculty.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-8 w-full max-w-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Add New Faculty</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Faculty Name (e.g. Dr. Kamal)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none"
          required
        />
        
        {/* ২. টেক্সট ইনপুট সরিয়ে সিলেক্ট বসানো হলো */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full md:w-1/3 p-2 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none"
          required
        >
          <option value="">Select Dept</option>
          {departments.length === 0 ? (
            <option disabled>Loading...</option>
          ) : (
            departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))
          )}
        </select>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-500 disabled:opacity-50 transition font-medium"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}