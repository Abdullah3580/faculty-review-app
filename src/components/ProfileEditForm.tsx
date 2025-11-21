// src/components/ProfileEditForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialNickname?: string | null;
  initialSemester?: string | null;
}

export default function ProfileEditForm({ initialNickname, initialSemester }: Props) {
  const [nickname, setNickname] = useState(initialNickname || "");
  const [semester, setSemester] = useState(initialSemester || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, semester }),
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
      <h2 className="text-xl font-bold mb-4 text-indigo-400">Edit Profile</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nickname</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:border-indigo-500 outline-none"
            placeholder="e.g. DarkKnight_24"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Semester</label>
          <input
            type="text"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:border-indigo-500 outline-none"
            placeholder="e.g. 5th Semester"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 py-2 rounded hover:bg-indigo-500 font-medium text-white transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}