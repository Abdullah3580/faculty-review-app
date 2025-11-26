"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    nickname: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  // একটি নতুন স্টেট ভেরিয়েবল যা ভেরিফিকেশন মেসেজ দেখাবে
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // টোস্ট মেসেজ দেখানো
        toast.success("Registration successful! Please check your email.");
        // সাকসেস মেসেজ দেখানোর জন্য স্টেট আপডেট
        setShowSuccessMessage(true); 
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // যদি সফলভাবে রেজিস্টার হয়, তবে এই মেসেজটি দেখাবে
  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-200 dark:border-gray-700 max-w-md w-full">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Check Your Email 📧</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We have sent a verification link to <strong>{formData.email}</strong>. 
            Please check your inbox (and spam folder) to verify your account before logging in.
          </p>
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Go to Login Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join the community to review faculties
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input name="name" type="text" required placeholder="Full Name" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none" />
          <input name="studentId" type="text" required placeholder="Student ID (e.g. 01123456)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none" />
          <input name="nickname" type="text" required placeholder="Anonymous Nickname" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none" />
          <input name="email" type="email" required placeholder="Varsity Email" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none" />
          <input name="password" type="password" required placeholder="Password" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none" />

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-500 disabled:opacity-50">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Sign in</Link>
        </div>
      </div>
    </div>
  );
}