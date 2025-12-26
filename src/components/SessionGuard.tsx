// src/components/SessionGuard.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function SessionGuard() {
  const { data: session } = useSession();

  useEffect(() => {
    // @ts-ignore
    if (session?.error === "UserDeleted") {
      alert("AccountDeleted: আপনার অ্যাকাউন্টটি মুছে ফেলা হয়েছে।");
      signOut({ callbackUrl: "/login" }); // লগআউট করে লগিন পেজে পাঠাবে
    }
  }, [session]);

  return null; // এটি স্ক্রিনে কিছু দেখাবে না, শুধু কাজ করবে
}