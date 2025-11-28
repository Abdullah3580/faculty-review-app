"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginPage() {
  // নাম পরিবর্তন করে identifier রাখা হলো (কারণ এটি ইমেইল বা আইডি দুই-ই হতে পারে)
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      // ব্যাকএন্ডে আমরা 'email' ফিল্ড এক্সপেক্ট করছি, তাই identifier-কে email নামে পাঠাচ্ছি
      email: identifier, 
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid Email/ID or password");
    } else {
      toast.success("Logged in successfully!");
      router.refresh(); // সেশন আপডেট করার জন্য রিফ্রেশ
      router.push("/"); // হোমপেজে রিডাইরেক্ট
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Welcome Back
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email or Student ID
            </label>
            <input
              type="text" // ⚠️ এটি 'text' করা হয়েছে যাতে আইডি বা ইমেইল দুটোই লেখা যায়
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition focus:border-indigo-500"
              placeholder="e.g. 01123456 or name@uiu.ac.bd" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition focus:border-indigo-500"
              placeholder="********" 
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition transform active:scale-95"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-sm mt-4">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Sign up</Link>
        </div>
      </div>
    </div>
  );
}