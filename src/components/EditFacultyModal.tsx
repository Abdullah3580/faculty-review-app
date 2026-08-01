"use client";

import { useState, useEffect, useRef } from "react";
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
  const [imageUrl, setImageUrl] = useState(faculty.image || "");
  const [previewUrl, setPreviewUrl] = useState(faculty.image || "");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"url" | "file">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetch("/api/department")
        .then((res) => res.json())
        .then((data) => setDepartments(data))
        .catch(() => toast.error("Failed to load departments"));
    }
  }, [isOpen]);

  const handleUrlChange = (val: string) => {
    setImageUrl(val);
    setPreviewUrl(val);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        setPreviewUrl(imageUrl);
        return;
      }

      setImageUrl(data.url);
      setPreviewUrl(data.url);
      toast.success("Image uploaded! ✅");
    } catch {
      toast.error("Upload failed");
      setPreviewUrl(imageUrl);
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
        body: JSON.stringify({ name, department, image: imageUrl }),
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Edit Faculty Info
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
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

              {/* Department */}
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

              {/* Image Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Profile Photo
                </label>

                {/* Preview */}
                <div className="flex justify-center mb-3">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl text-white font-bold shadow">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewUrl("")}
                      />
                    ) : (
                      name.charAt(0)
                    )}
                  </div>
                </div>

                {/* Tab Toggle */}
                <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadTab("file")}
                    className={`flex-1 py-2 text-sm font-medium transition ${
                      uploadTab === "file"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTab("url")}
                    className={`flex-1 py-2 text-sm font-medium transition ${
                      uploadTab === "url"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    🔗 Image URL
                  </button>
                </div>

                {uploadTab === "file" ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition"
                  >
                    {uploading ? (
                      <p className="text-sm text-indigo-500 animate-pulse">Uploading...</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-500">Click to select image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 2MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 outline-none transition text-gray-900 dark:text-white"
                  />
                )}

                {/* Remove photo */}
                {(imageUrl || previewUrl) && (
                  <button
                    type="button"
                    onClick={() => { setImageUrl(""); setPreviewUrl(""); }}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    ✕ Remove photo
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={loading || uploading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading}
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