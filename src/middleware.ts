// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 1. Rate Limiter
const ratelimit = new Map();

function checkRateLimit(ip: string) {
  const windowMs = 60 * 1000;
  const maxReq = 60;
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
  if (record.count >= maxReq) return false;
  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  
  // ১. Rate Limit চেক
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests. Please slow down.", { status: 429 });
  }

  // ২. অথেনটিকেশন চেক
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // 👇 পাবলিক পেজ লিস্ট (এখানে পাসওয়ার্ড রিসেট পেজগুলো যোগ করা হয়েছে)
  const isPublicPath = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" ||  // ✅ নতুন যোগ করা হলো
    pathname === "/reset-password" ||   // ✅ নতুন যোগ করা হলো
    pathname.startsWith("/verify-email") || 
    pathname.startsWith("/api/auth") ||     
    pathname === "/api/register" || 
    pathname === "/auth-error";

  // লজিক ১: লগইন ছাড়া প্রাইভেট পেজে গেলে লগইন পেজে পাঠাবে
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // লজিক ২: লগইন থাকা অবস্থায় লগইন/রেজিস্টার বা পাসওয়ার্ড রিসেট পেজে গেলে হোমে পাঠাবে
  if (token && (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // লজিক ৩: এডমিন চেক
  if (pathname.startsWith("/admin")) {
    // @ts-ignore
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};