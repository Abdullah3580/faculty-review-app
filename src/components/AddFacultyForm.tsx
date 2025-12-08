
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AddFacultyForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    designation: "Lecturer",
    initial: "",
    code: ""
  });

  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("/api/departments");
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error("Failed to load departments");
      }
    };

    
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        toast.success("Faculty added successfully!");
        setIsOpen(false);
        
        setFormData({ name: "", department: "", designation: "Lecturer", initial: "", code: "" });
        window.location.reload();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add faculty");
      }
    } catch (error) {
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
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Faculty</h2>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500">✖</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Faculty Name <span className="text-red-500">*</span></label>
              <input name="name" type="text" required placeholder="e.g. Dr. Abul Kashem" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department <span className="text-red-500">*</span></label>
                <select 
                  name="department" 
                  required 
                  value={formData.department} 
                  onChange={handleChange} 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="" disabled>Select Department</option>
                  
                  {departments.length === 0 ? (
                    <option disabled>Loading departments...</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label>
                <select name="designation" value={formData.designation} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                  <option value="Vice Chancellor">Vice Chancellor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                  <option value="Professor">Professor</option>
                  <option value="Lecturer">Lecturer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial (Optional)</label>
                <input name="initial" type="text" placeholder="e.g. MSA" value={formData.initial} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code / Room (Optional)</label>
                <input name="code" type="text" placeholder="e.g. 1234" value={formData.code} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50 font-bold">
              {loading ? "Adding..." : "Submit Faculty"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}