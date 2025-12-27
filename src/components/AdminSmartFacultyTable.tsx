"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  faculties: any[];
  departments: any[];
}

export default function AdminSmartFacultyTable({ faculties, departments }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetDept, setTargetDept] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // সার্চ ফিল্টার
  const filteredFaculties = faculties.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // চেকবাক্স লজিক
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredFaculties.map((f) => f.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // বাল্ক আপডেট ফাংশন
  const handleBulkUpdate = async () => {
    if (!targetDept) return toast.error("Please select a department");
    setIsUpdating(true);

    try {
      const res = await fetch("/api/faculty/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          data: { department: targetDept },
        }),
      });

      if (res.ok) {
        toast.success(`Successfully updated ${selectedIds.length} faculties!`);
        setSelectedIds([]);
        router.refresh(); // পেজ রিফ্রেশ করে নতুন ডাটা দেখাবে
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full">
      {/* অ্যাকশন বার এবং সার্চ */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        
        {/* সার্চ বক্স */}
        <input
          type="text"
          placeholder="🔍 Search faculty..."
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* বাল্ক অ্যাকশন টুলবার (শুধু যখন সিলেক্ট করা হবে তখন দেখাবে) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap px-2">
              {selectedIds.length} selected
            </span>
            
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              className="text-sm border-gray-300 rounded-md p-1.5 dark:bg-gray-800 dark:border-gray-600"
            >
              <option value="">Move to Dept...</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <button
              onClick={handleBulkUpdate}
              disabled={isUpdating}
              className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isUpdating ? "Updating..." : "Update"}
            </button>
          </div>
        )}
      </div>

      {/* টেবিল */}
      <div className="overflow-x-auto max-h-[500px] custom-scrollbar border border-gray-200 dark:border-gray-800 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
            <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedIds.length === filteredFaculties.length && filteredFaculties.length > 0}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="p-4">Name</th>
              <th className="p-4">Current Dept</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredFaculties.length === 0 ? (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-gray-400">No faculty found.</td>
               </tr>
            ) : (
              filteredFaculties.map((faculty) => (
                <tr
                  key={faculty.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    selectedIds.includes(faculty.id) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(faculty.id)}
                      onChange={() => handleSelectOne(faculty.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900 dark:text-white">{faculty.name}</div>
                    <div className="text-xs text-gray-500">{faculty.designation || "Faculty"}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        faculty.department === "GENERAL"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {faculty.department}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {/* এখানে এডিট বাটন রাখতে পারেন */}
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-2 text-xs text-gray-400 text-right">
        Showing {filteredFaculties.length} entries
      </div>
    </div>
  );
}