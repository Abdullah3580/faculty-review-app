// src/app/auth-error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Authentication Error ⚠️</h1>
      <p className="text-gray-300 mb-8 text-lg">
        {error ? `Error Code: ${error}` : "An unknown error occurred during login."}
      </p>
      <Link 
        href="/" 
        className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition font-medium"
      >
        ← Back to Home
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading error details...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}