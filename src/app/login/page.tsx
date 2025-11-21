// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Auth.js-কে বলা হচ্ছে 'email' provider দিয়ে সাইন ইন শুরু করতে
      const result = await signIn("email", {
        email: email,
        redirect: false, // আমরা নিজেরা পেজ চেঞ্জ করবো
        callbackUrl: "/", // লগইন সফল হলে হোম পেজে পাঠাবে
      });

      if (result?.error) {
        // যদি authOptions-এর signIn callback false রিটার্ন করে (যেমন: @gmail.com)
        setError("Invalid email domain. Please use your university email.");
      } else if (result?.ok) {
        // ইমেল সফলভাবে পাঠানো হয়েছে
        // Auth.js নিজে থেকেই /verify-request পেজে পাঠিয়ে দেয়
        // অথবা আপনি নিজে পাঠাতে পারেন:
        router.push("/verify-request");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Sign In / Register
        </h1>
        <p className="text-center text-gray-600">
          Use your university email to get a magic link.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              University Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              placeholder="e.g. your.name@bracuniversity.net"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>

          {error && (
            <p className="text-center text-sm text-red-600">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}