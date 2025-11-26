// src/app/verify-email/page.tsx

// এটা server component
import dynamic from "next/dynamic";

// client component lazy load করা হচ্ছে, ssr বন্ধ
const VerifyEmailClient = dynamic(() => import("./VerifyEmailClient"), { ssr: false });

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
