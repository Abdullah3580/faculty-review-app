// src/components/SearchBox.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("q") || "");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (text) {
        router.push(`/?q=${text}`);
      } else {
        router.push("/");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text, router]);

  return (
    // mb-8 সরিয়ে ফেলা হয়েছে এবং w-full রাখা হয়েছে
    <div className="w-full">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="🔍 Search faculty..."
        className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 outline-none transition shadow-sm text-sm"
      />
    </div>
  );
}