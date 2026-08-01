"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  faculty: {
    id: string;
    name: string;
    department: string;
    image?: string | null;
  };
}

export default function EditFacultyModal({ faculty }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(faculty.name);
  const [department, setDepartment] = useState(faculty.department);
  const [image, setImage] = useState(faculty.image || "");
  const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // মডাল ওপেন হলে ডিপার্টমেন্ট লিস্ট লোড করা হবে
  useEffect(() => {
    if (isOpen) {
      fetch("/api/department")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch(() => toast.error("Failed to load departments"));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/faculty/${faculty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // এখানে image ফিল্ড পাঠানো হচ্ছে
        body: JSON.stringify({ name, department, image }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Faculty info updated successfully! ✏️");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update faculty.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-sm bg-gray-200 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-indigo-900/50 text-gray-700 hover:text-indigo-700 dark:text-gray-300 dark:hover:text-indigo-400 px-3 py-1 rounded-full transition font-medium border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700"
      >
        ✏️ Edit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Faculty Info</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faculty Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-bold disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}