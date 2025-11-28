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
  const ip = request.ip || "127.0.0.1";
  
  // ১. Rate Limit চেক (Security)
  if (!checkRateLimit(ip)) {
    return new NextResponse("Too Many Requests. Please slow down.", { status: 429 });
  }

  // ২. অথেনটিকেশন চেক (Auth Guard)
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // লগইন করা থাকলে কেউ আর লগইন/রেজিস্টার পেজে যেতে পারবে না
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // এডমিন পেজ প্রটেকশন
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // @ts-ignore
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth-error?error=AccessDenied", request.url));
    }
  }

  // ইউজার/প্রোফাইল পেজ প্রটেকশন
  if (pathname.startsWith("/profile") || pathname.startsWith("/compare")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// কোন কোন পাথে এই মিডলওয়্যার কাজ করবে
export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/compare/:path*",
    "/login",
    "/register",
    "/api/auth/:path*" 
  ],
};