//src/app/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// ফর্ম কম্পোনেন্ট
function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully! Please login.");
        router.push("/login");
      } else {
        // ব্যাকএন্ড থেকে আসা পাসওয়ার্ড পলিসি এরর এখানে দেখাবে
        toast.error(data.error || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">Set New Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
          <input
            type="password"
            placeholder="Enter strong password"
            required
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 outline-none focus:border-indigo-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {/* ✅ ইউজারকে গাইড করার জন্য ইনস্ট্রাকশন টেক্সট */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Must contain: Min 8 chars, Uppercase (A-Z), Lowercase (a-z), Number (0-9) & Special Character (!@#).
          </p>
        </div>
        
        <button 
          disabled={loading} 
          className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

// মেইন পেজ
export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}