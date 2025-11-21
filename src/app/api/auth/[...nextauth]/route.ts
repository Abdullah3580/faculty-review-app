// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma"; // আমাদের তৈরি করা Prisma Client
import EmailProvider from "next-auth/providers/email";

// --- আপনার ইউনিভার্সিটির ইমেল ডোমেইন এখানে লিখুন ---
// আপনার ভার্সিটির ডোমেইন "@" চিহ্নের পরের অংশটি হবে।
const ALLOWED_EMAIL_DOMAIN = "gmail.com"; 
// --- এটি পরিবর্তন করুন ---

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER,
      port: 587, // Resend-এর জন্য 587
      auth: {
        user: process.env.EMAIL_SERVER_USER, // user: "resend"
        pass: process.env.EMAIL_SERVER_PASSWORD, // pass: "re_..."
      },
    },
    from: process.env.EMAIL_FROM,
  }),
],

  // --- আমাদের কাস্টম নিয়ম (Rules) ---
  callbacks: {
    async signIn({ user }) {
      console.log("--- সাইন-ইন করার চেষ্টা ---");
    console.log("ব্যবহারকারীর ইমেল:", user.email);
    console.log("অনুমোদিত ডোমেইন:", ALLOWED_EMAIL_DOMAIN);
      if (!user.email) {
        return false; // ইমেল না থাকলে সাইন ইন করতে দেবে না
      }

      // শুধু নির্দিষ্ট ডোমেইনের ইমেল অ্যাপ্রুভ করবে
      if (user.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        return true; // লগইন সফল
      } else {
        // অন্য ইমেল (@gmail.com) হলে error পেজে পাঠাবে
        return "/auth-error?error=InvalidEmailDomain";
      }
    },
    
    async session({ session, user }: { session: any; user: any }) {
      // সেশনে (Session) ইউজারের 'id' এবং 'nickname' যোগ করা
      // যাতে আমরা ফ্রন্টএন্ড থেকে এটি অ্যাক্সেস করতে পারি
      session.user.id = user.id;
      session.user.nickname = user.nickname;
      return session;
    },
  },

  // কাস্টম পেজের ঠিকানা (এগুলো আমরা পরে তৈরি করবো)
  pages: {
    signIn: "/login", // লগইন পেজ
    verifyRequest: "/verify-request", // "আপনার ইমেল চেক করুন" পেজ
    error: "/auth-error", // Error পেজ
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };