"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  faculty: {
    id: string;
    name: string;
    department: string;
    designation?: string | null;
    initial?: string | null;
    code?: string | null;
    email?: string | null;
    roomNumber?: string | null;
    image?: string | null;
  };
}

export default function EditFacultyModal({ faculty }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");
  const [previewUrl, setPreviewUrl] = useState(faculty.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: faculty.name,
    department: faculty.department,
    designation: faculty.designation || "Lecturer",
    initial: faculty.initial || "",
    code: faculty.code || "",
    email: faculty.email || "",
    roomNumber: faculty.roomNumber || "",
    image: faculty.image || "",
  });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/department")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch(() => toast.error("Failed to load departments"));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUrlChange = (val: string) => {
    setFormData({ ...formData, image: val });
    setPreviewUrl(val);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        setPreviewUrl(formData.image);
        return;
      }

      setFormData((prev) => ({ ...prev, image: data.url }));
      setPreviewUrl(data.url);
      toast.success("Image uploaded! ✅");
    } catch {
      toast.error("Upload failed");
      setPreviewUrl(formData.image);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/faculty/${faculty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Faculty updated! ✏️");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Faculty Info</h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Faculty Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name" type="text" required
                  value={formData.name} onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                />
              </div>

              {/* Department + Designation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department" required
                    value={formData.department} onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                  <select
                    name="designation"
                    value={formData.designation} onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  >
                    <option value="Vice Chancellor">Vice Chancellor</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>

              {/* Initial + Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial</label>
                  <input
                    name="initial" type="text" placeholder="e.g. MSA"
                    value={formData.initial} onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
                  <input
                    name="code" type="text" placeholder="e.g. 1234"
                    value={formData.code} onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Email + Room Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    name="email" type="email" placeholder="e.g. teacher@uiu.ac.bd"
                    value={formData.email} onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Number</label>
                  <input
                    name="roomNumber" type="text" placeholder="e.g. 412"
                    value={formData.roomNumber} onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Photo</label>

                {/* Preview */}
                <div className="flex justify-center mb-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold shadow">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"
                        onError={() => setPreviewUrl("")} />
                    ) : (
                      formData.name.charAt(0)
                    )}
                  </div>
                </div>

                {/* Tab Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 mb-3">
                  <button type="button" onClick={() => setUploadTab("file")}
                    className={`flex-1 py-2 text-sm font-medium transition ${uploadTab === "file" ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                    📁 Upload File
                  </button>
                  <button type="button" onClick={() => setUploadTab("url")}
                    className={`flex-1 py-2 text-sm font-medium transition ${uploadTab === "url" ? "bg-indigo-600 text-white" : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                    🔗 Image URL
                  </button>
                </div>

                {uploadTab === "file" ? (
                  <div onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition">
                    {uploading ? (
                      <p className="text-sm text-indigo-500 animate-pulse">Uploading...</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">Click to select image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 2MB</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                ) : (
                  <input
                    type="url" placeholder="https://example.com/photo.jpg"
                    value={formData.image}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  />
                )}

                {(formData.image || previewUrl) && (
                  <button type="button"
                    onClick={() => { setFormData(p => ({ ...p, image: "" })); setPreviewUrl(""); }}
                    className="mt-2 text-xs text-red-500 hover:underline">
                    ✕ Remove photo
                  </button>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)}
                  disabled={loading || uploading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={loading || uploading}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition font-bold disabled:opacity-50 shadow-md">
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