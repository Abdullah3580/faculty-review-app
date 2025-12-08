"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 

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
  
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMessages, setErrorMessages] = useState<string[]>([]); 
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessages.length > 0) setErrorMessages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessages([]); 

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
        if (data.errors && Array.isArray(data.errors)) {
          setErrorMessages(data.errors);
          toast.error(data.errors[0]); 
        } else if (data.error) {
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
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join the community to review faculties anonymously
          </p>
        </div>

        {/* 🔒 Privacy Notice */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-lg flex gap-3 text-left shadow-sm">
          <span className="text-xl">🔒</span>
          <div className="text-xs text-indigo-900 dark:text-indigo-200">
            <p className="font-bold mb-1">Your identity is hidden!</p>
            <p className="opacity-90 leading-relaxed">
              Your <span className="font-semibold">Name</span>, <span className="font-semibold">ID</span>, and <span className="font-semibold">Email</span> will remain completely <span className="font-bold underline">confidential</span>. 
              Only your <strong>Anonymous Name</strong> will be visible to others.
            </p>
          </div>
        </div>

        {/* ⚠️ Error Messages List */}
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

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input name="name" type="text" required placeholder="Full Name  (Will be Hidden)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          <input name="studentId" type="text" required placeholder="Student ID  (Will be Hidden)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          
          <div className="relative">
            <input name="nickname" type="text" required placeholder="Anonymous Name (Visible to Public)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border-2 border-indigo-100 dark:border-indigo-800 outline-none focus:border-indigo-500 transition" />
            <span className="absolute right-3 top-3.5 text-xs text-gray-400">Public</span>
          </div>

          <input name="email" type="email" required placeholder="Varsity Email  (Hidden)" onChange={handleChange} className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition" />
          
          {/* ✅ ৩. পাসওয়ার্ড ইনপুট ফিল্ড আপডেট (শো/হাইড ফিচার সহ) */}
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="Password" 
              onChange={handleChange} 
              className="w-full p-3 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 outline-none focus:border-indigo-500 transition pr-10" 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 transition"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-500/30">
            {loading ? "Creating Account..." : "Sign Up Securely"}
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