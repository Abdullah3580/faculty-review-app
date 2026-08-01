"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function AddFacultyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    designation: "Lecturer",
    initial: "",
    code: "",
    email: "",
    roomNumber: "",
    image: "",
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
      const res = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Faculty added! Pending admin approval.");
        setIsOpen(false);
        setFormData({ name: "", department: "", designation: "Lecturer", initial: "", code: "", email: "", roomNumber: "", image: "" });
        setPreviewUrl("");
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add faculty");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:text-indigo-600 hover:border-indigo-400 transition font-bold"
        >
          + Add New Faculty
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Faculty</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">✖</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Faculty Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name" type="text" required
                placeholder="e.g. Dr. Abul Kashem"
                value={formData.name} onChange={handleChange}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="" disabled>Select Department</option>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                <select
                  name="designation"
                  value={formData.designation} onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial (Optional)</label>
                <input
                  name="initial" type="text" placeholder="e.g. MSA"
                  value={formData.initial} onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code (Optional)</label>
                <input
                  name="code" type="text" placeholder="e.g. 1234"
                  value={formData.code} onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Email + Room Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Optional)</label>
                <input
                  name="email" type="email" placeholder="e.g. teacher@uiu.ac.bd"
                  value={formData.email} onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Number (Optional)</label>
                <input
                  name="roomNumber" type="text" placeholder="e.g. 412"
                  value={formData.roomNumber} onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profile Photo (Optional)
              </label>

              {/* Preview */}
              <div className="flex justify-center mb-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl text-white font-bold shadow">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"
                      onError={() => setPreviewUrl("")} />
                  ) : (
                    formData.name.charAt(0) || "?"
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
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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

            <button
              type="submit" disabled={loading || uploading}
              className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50 font-bold"
            >
              {loading ? "Adding..." : "Submit Faculty"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}