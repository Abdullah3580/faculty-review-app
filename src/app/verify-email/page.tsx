"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("Invalid Token");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("✅ Email Verified Successfully!");
          toast.success("Email verified! Redirecting to login...");
          setTimeout(() => router.push("/login"), 3000);
        } else {
          setStatus("❌ Verification Failed: " + data.error);
          toast.error(data.error);
        }
      } catch (error) {
        setStatus("❌ Something went wrong");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center border border-gray-200 dark:border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-gray-500 text-sm">Please wait while we verify your token.</p>
      </div>
    </div>
  );
}
