//src/app/admin/page.tsx
"use client";

import { useState } from "react";
import AdminDepartmentManager from "@/components/AdminDepartmentManager";
import AdminStudentList from "@/components/AdminStudentList";
import AdminFacultyManager from "@/components/AdminFacultyManager";

interface Props {
  departments: any[];
  students: any[];
  faculties: any[];
}

export default function AdminDashboardSections({ departments, students, faculties }: Props) {
  // কনফিগারেশন: শুরুতে সব বন্ধ থাকবে ("")।
  const [activeSection, setActiveSection] = useState<string>("");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? "" : section);
  };

  return (
    <div className="space-y-4 w-full">
      
      {/* ১. ডিপার্টমেন্ট ম্যানেজমেন্ট */}
      <div className="glass-card overflow-hidden rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => toggleSection("dept")}
          className={`w-full flex justify-between items-center p-5 text-left transition-colors ${
            activeSection === "dept" ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Department Management</h3>
              <p className="text-xs text-gray-500">Manage university departments</p>
            </div>
          </div>
          <span className={`text-xl transition-transform duration-300 ${activeSection === "dept" ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        
        {activeSection === "dept" && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
            <AdminDepartmentManager departments={departments} />
          </div>
        )}
      </div>

      {/* ২. স্টুডেন্ট ম্যানেজমেন্ট */}
      <div className="glass-card overflow-hidden rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => toggleSection("student")}
          className={`w-full flex justify-between items-center p-5 text-left transition-colors ${
            activeSection === "student" ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
             <span className="text-2xl">👨‍🎓</span>
             <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Student / User Management</h3>
              <p className="text-xs text-gray-500">View and manage registered students</p>
            </div>
          </div>
          <span className={`text-xl transition-transform duration-300 ${activeSection === "student" ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        
        {activeSection === "student" && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
            <AdminStudentList students={students} />
          </div>
        )}
      </div>

      {/* ৩. ফ্যাকাল্টি ম্যানেজমেন্ট */}
      <div className="glass-card overflow-hidden rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => toggleSection("faculty")}
          className={`w-full flex justify-between items-center p-5 text-left transition-colors ${
            activeSection === "faculty" ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <div className="flex items-center gap-3">
             <span className="text-2xl">👨‍🏫</span>
             <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Faculty Database</h3>
              <p className="text-xs text-gray-500">Add, edit, and bulk update faculties</p>
            </div>
          </div>
          <span className={`text-xl transition-transform duration-300 ${activeSection === "faculty" ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
        
        {activeSection === "faculty" && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
            <AdminFacultyManager faculties={faculties} departments={departments} />
          </div>
        )}
      </div>

    </div>
  );
}