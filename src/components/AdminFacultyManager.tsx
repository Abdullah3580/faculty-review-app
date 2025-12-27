"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  faculties: any[];
  departments: any[];
}

export default function AdminFacultyManager({ faculties, departments }: Props) {
  const router = useRouter();
  
  // স্টেটস (States)
  const [selectedIds, setSelectedIds] = useState<string[]>([]); // চেকবক্সের জন্য
  const [searchTerm, setSearchTerm] = useState(""); // সার্চের জন্য
  const [editingFaculty, setEditingFaculty] = useState<any | null>(null); // এডিট মডালের জন্য
  const [targetDept, setTargetDept] = useState(""); // বাল্ক আপডেটের জন্য
  const [isUpdating, setIsUpdating] = useState(false); // লোডিং ইন্ডিকেটর

  // 🔍 সার্চ ফিল্টার
  const filteredFaculties = faculties.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ সব সিলেক্ট করার লজিক
  const handleSelectAll = (e: any) => {
    if (e.target.checked) setSelectedIds(filteredFaculties.map(f => f.id));
    else setSelectedIds([]);
  };

  // ✅ একটা সিলেক্ট করার লজিক
  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(sid => sid !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  // ⚡ বাল্ক আপডেট (একসাথে অনেকগুলো)
  const handleBulkUpdate = async () => {
    if (!targetDept) return toast.error("Select a department first");
    setIsUpdating(true);
    try {
      await fetch("/api/faculty/bulk", {
        method: "PATCH",
        body: JSON.stringify({ ids: selectedIds, data: { department: targetDept } }),
      });
      toast.success(`Updated ${selectedIds.length} faculties!`);
      setSelectedIds([]); // সিলেকশন ক্লিয়ার
      router.refresh(); // পেজ রিফ্রেশ
    } catch { toast.error("Failed to update"); }
    setIsUpdating(false);
  };

  // 🗑️ ডিলিট লজিক
  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete?")) return;
    try {
      await fetch(`/api/faculty/${id}`, { method: "DELETE" });
      toast.success("Deleted successfully!");
      router.refresh();
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="w-full space-y-4">
      
      {/* 🛠️ উপরের কন্ট্রোল বার */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <input 
          type="text" 
          placeholder="🔍 Search faculty..." 
          className="px-4 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 w-full md:w-1/3 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* বাল্ক অ্যাকশন বাটন (সিলেক্ট করলে দেখাবে) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 animate-fadeIn">
            <span className="text-sm font-bold text-indigo-600">{selectedIds.length} selected</span>
            <select 
              className="p-2 rounded border text-sm dark:bg-gray-700"
              onChange={(e) => setTargetDept(e.target.value)}
            >
              <option value="">Select Dept...</option>
              {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <button 
              onClick={handleBulkUpdate} 
              disabled={isUpdating}
              className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
            >
              {isUpdating ? "..." : "Update All"}
            </button>
          </div>
        )}
      </div>

      {/* 📊 মেইন টেবিল */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
              <tr className="text-xs uppercase text-gray-500 font-bold">
                <th className="p-4 w-10">
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === filteredFaculties.length && filteredFaculties.length > 0} />
                </th>
                <th className="p-4">Faculty Name</th>
                <th className="p-4">Department</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredFaculties.map((faculty) => (
                <tr key={faculty.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${selectedIds.includes(faculty.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                  <td className="p-4">
                    <input type="checkbox" checked={selectedIds.includes(faculty.id)} onChange={() => handleSelectOne(faculty.id)} />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900 dark:text-white">{faculty.name}</div>
                    <div className="text-xs text-gray-400">{faculty.designation || "N/A"}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${faculty.department === 'GENERAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 dark:bg-gray-600 dark:text-gray-200'}`}>
                      {faculty.department}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingFaculty(faculty)} 
                      className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(faculty.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✏️ এডিট পপআপ মডাল (নিচে আলাদা কম্পোনেন্ট হিসেবে কল করা হয়েছে) */}
      {editingFaculty && (
        <EditModal 
          faculty={editingFaculty} 
          departments={departments} 
          onClose={() => setEditingFaculty(null)} 
        />
      )}
    </div>
  );
}

// 👇 মডাল কম্পোনেন্ট (একই ফাইলে রাখা হলো যাতে আপনার সুবিধা হয়)
function EditModal({ faculty, departments, onClose }: any) {
  const router = useRouter();
  const [formData, setFormData] = useState({ ...faculty });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/faculty/${faculty.id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      toast.success("Updated Successfully!");
      router.refresh();
      onClose();
    } catch { toast.error("Failed to update"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Faculty Details</h2>
        <form onSubmit={handleSave} className="space-y-3">
          
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
            <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Department</label>
                <select className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Designation</label>
                <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" value={formData.designation || ""} onChange={e => setFormData({...formData, designation: e.target.value})} />
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
            <input className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700" value={formData.image || ""} onChange={e => setFormData({...formData, image: e.target.value})} />
          </div>

          <div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}