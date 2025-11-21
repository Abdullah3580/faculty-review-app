// src/app/auth-error/page.tsx
"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = "An unexpected error occurred. Please try again.";

  if (error === "InvalidEmailDomain") {
    errorMessage = "You must use a valid university email to sign in.";
  }
  // আপনি চাইলে এখানে আরও কাস্টম error মেসেজ যোগ করতে পারেন

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-red-600">
          Authentication Error
        </h1>
        <p className="text-center text-gray-700">
          {errorMessage}
        </p>
        <Link href="/login">
          <span className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            Back to Login
          </span>
        </Link>
      </div>
    </div>
  );
}