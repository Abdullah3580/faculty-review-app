"use client";

import { useEffect } from "react";

export default function ContentProtector() {
  useEffect(() => {
    // ১. রাইট ক্লিক (Context Menu) ডিজেবল করা
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // ২. কিবোর্ড শর্টকাট (Copy, Inspect, View Source) ডিজেবল করা
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 (Inspect Element)
      if (e.key === "F12") {
        e.preventDefault();
      }
      
      // Ctrl + Shift + I (Inspect) বা Ctrl + Shift + J (Console) বা Ctrl + Shift + C (Select Element)
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }

      // Ctrl + C (Copy) - যদিও CSS দিয়ে বন্ধ করা আছে, তবুও এক্সট্রা লেয়ার
      if (e.ctrlKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
      }
    };

    // ইভেন্ট লিসেনার যোগ করা
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // ক্লিনআপ ফাংশন (কম্পোনেন্ট সরে গেলে লিসেনার মুছে ফেলা)
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null; // এটি দৃশ্যমান কিছু রেন্ডার করবে না, শুধু ব্যাকগ্রাউন্ডে কাজ করবে
}