// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 1. Rate Limiter (Simple In-Memory)
const ratelimit = new Map();

function checkRateLimit(ip: string) {
  const windowMs = 60 * 1000; // ১ মিনিট
  const maxReq = 60; // প্রতি মিনিটে সর্বোচ্চ ৬০টি রিকোয়েস্ট

  const now = Date.now();
  const record = ratelimit.get(ip);

  if (!record) {
    ratelimit.set(ip, { count: 1, startTime: now });
    return true;
  }

  if (now - record.startTime > windowMs) {
    ratelimit.set(ip, { count: 1, startTime: now });
    return true;
  }

  if (record.count >= maxReq) {
    return false; 
  }

  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  // আইপি পাওয়ার নিরাপদ উপায় (Vercel/Production এর জন্য)
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  
  // ১. Rate Limit চেক (Security)
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests. Please slow down.", { status: 429 });
  }

  // ২. অথেনটিকেশন চেক (Auth Guard)
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // যে পেজগুলো পাবলিক (লগইন ছাড়াই দেখা যাবে)
  // যেমন: লগইন, রেজিস্ট্রেশন, ইমেইল ভেরিফিকেশন এবং অথেনটিকেশন API
  const isPublicPath = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname.startsWith("/verify-email") || // ইমেইল ভেরিফিকেশন পেজ
    pathname.startsWith("/api/auth") ||     // লগইন API
    pathname === "/auth-error";

  // লজিক ১: ইউজার যদি লগইন করা না থাকে এবং পাবলিক পেজে না থাকে -> লগইন পেজে পাঠাও
  // এর ফলে হোমপেজ (/) সহ সব পেজ প্রটেক্টেড হয়ে যাবে
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // লজিক ২: ইউজার যদি লগইন করা থাকে এবং আবার লগইন/রেজিস্টার পেজে যেতে চায় -> হোমপেজে পাঠাও
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // লজিক ৩: এডমিন পেজ প্রটেকশন
  if (pathname.startsWith("/admin")) {
    // @ts-ignore
    if (token?.role !== "ADMIN") {
      // এডমিন না হলে হোমপেজে ফেরত পাঠাবে
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// কনফিগারেশন আপডেট: সব রাউট চেক করবে
export const config = {
  // এখানে বলা হয়েছে: _next/static, _next/image, favicon.ico ছাড়া সব পেজে মিডলওয়্যার চলবে
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};