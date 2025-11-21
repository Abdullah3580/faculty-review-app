// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // এখানে আমরা চেক করবো ইউজার অ্যাডমিন কিনা (টোকেন থেকে)
    // দ্রষ্টব্য: রোল চেকিংয়ের জন্য আমাদের next-auth সেশনে রোল পাস করতে হবে, 
    // তবে আপাতত আমরা নিশ্চিত করছি যে '/admin' এ ঢুকতে হলে অন্তত লগইন থাকতেই হবে।
    // রোল চেকিং পেজ লেভেলেই থাকছে এক্সট্রা লেয়ার হিসেবে।
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // টোকেন থাকলেই কেবল ঢুকতে দেবে
    },
  }
);

// কোন কোন পাথে এই রুল অ্যাপ্লাই হবে
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*"],
};