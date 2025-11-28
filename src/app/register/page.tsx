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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // ✅ আপডেট: এখন আমরা একটি array (তালিকা) রাখব, শুধু একটি string না
  const [errorMessages, setErrorMessages] = useState<string[]>([]); 
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // ইউজার টাইপ করা শুরু করলে এরর লিস্ট ক্লিয়ার করে দেব
    if (errorMessages.length > 0) setErrorMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages([]); // সাবমিটের শুরুতে এরর রিসেট

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch (err) {
        data = { errors: ["Something went wrong on the server."] };
      }

      if (res.ok) {
        toast.success("Registration successful!");
        setShowSuccessMessage(true);
      } else {
        // ✅ আপডেট: সার্ভার থেকে আসা 'errors' অ্যারে রিসিভ করা
        if (data.errors && Array.isArray(data.errors)) {
          setErrorMessages(data.errors);
          // টোস্টে শুধু প্রথম এররটি দেখাবে, যাতে হিজিবিজি না হয়
          toast.error(data.errors[0]); 
        } else if (data.error) {
           // যদি ব্যাকএন্ড ভুলবশত একটা string পাঠায়, তাও হ্যান্ডেল করব
           setErrorMessages([data.error]);
           toast.error(data.error);
        } else {
           setErrorMessages(["Registration failed."]);
        }
      }
    } catch (error) {
      setErrorMessages(["Network error. Please check your connection."]);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-200 dark:border-gray-700 max-w-md w-full">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Check Your Email 📧</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We have sent a verification link to <strong>{formData.email}</strong>. 
            Please check your inbox (and spam folder).
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

        {/* ✅ আপডেট: এরর লিস্ট দেখানোর লজিক */}
        {errorMessages.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 p-4 rounded text-sm animate-pulse">
            <p className="font-bold mb-1">⚠️ Please fix the following:</p>
            <ul className="list-disc list-inside space-y-1">
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input name="name" type="text" required placeholder="Full Name" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          <input name="studentId" type="text" required placeholder="Student ID (e.g. 01123456)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          <input name="nickname" type="text" required placeholder="Anonymous Nickname" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          <input name="email" type="email" required placeholder="Varsity Email (@uiu.ac.bd)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          <input name="password" type="password" required placeholder="Password" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-500 disabled:opacity-50 transition">
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