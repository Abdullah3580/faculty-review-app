// src/app/verify-request/page.tsx

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Check Your Email
        </h1>
        <p className="text-center text-gray-600">
          A magic link has been sent to your email address.
        </p>
        <p className="text-center text-sm text-gray-500">
          Please check your inbox (and spam folder) to sign in.
        </p>
      </div>
    </div>
  );
}