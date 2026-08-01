"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Props {
  facultyId: string;
  facultyName: string;
}

export default function DeleteFacultyButton({ facultyId, facultyName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faculty", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facultyId, action: "reject" }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        alert("Failed to delete faculty");
        setShowConfirm(false);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        title="Delete Faculty"
        className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
      >
        <Trash2 size={18} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Faculty?
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {facultyName}
              </span>{" "}
              কে delete করলে তার সব reviews এবং questions ও মুছে যাবে। এই কাজ
              undone করা যাবে না।
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}