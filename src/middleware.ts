// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// আলাদা আলাদা rate limit map
const rateLimitMap = new Map<string, { count: number; startTime: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now - record.startTime > windowMs) {
    rateLimitMap.set(key, { count: 1, startTime: now });
    return true;
  }

  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "127.0.0.1";
  const { pathname } = request.nextUrl;

  // ১. Login/Register এ কড়া limit — per IP ৫ req/min (brute force আটকাবে)
  if (pathname === "/api/register" || pathname.startsWith("/api/auth/signin")) {
    if (!checkRateLimit(`auth:${ip}`, 5, 60 * 1000)) {
      return new NextResponse("Too many attempts. Please wait a minute.", { status: 429 });
    }
  }
  // ২. বাকি API routes — per IP ১২০ req/min
  else if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(`api:${ip}`, 120, 60 * 1000)) {
      return new NextResponse("Too Many Requests.", { status: 429 });
    }
  }
  // ৩. Page routes — per IP ২০০ req/min (page load এ অনেক request হয়)
  else {
    if (!checkRateLimit(`page:${ip}`, 200, 60 * 1000)) {
      return new NextResponse("Too Many Requests.", { status: 429 });
    }
  }

  const token = await getToken({ req: request });

  const isPublicPath =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/verify-email") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/register" ||
    pathname === "/api/ping" ||
    pathname === "/auth-error" ||
    pathname.startsWith("/faculty/");

  // Login না করলে protected page এ যেতে পারবে না
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Login করা থাকলে login/register page এ গেলে home এ redirect
  if (token && (pathname === "/login" || pathname === "/register" || pathname === "/forgot-password")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Admin route — শুধু ADMIN role এর জন্য
  if (pathname.startsWith("/admin")) {
    if (token?.role?.toUpperCase() !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};