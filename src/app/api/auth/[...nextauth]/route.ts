// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import EmailProvider from "next-auth/providers/email";

// --- কনফিগারেশন ---
const ADMIN_EMAIL = "mdabdullahalsiam358@gmail.com"; // আপনার জিমেইল (যেটা দিয়ে অ্যাডমিন লগইন করবেন)
const VARSITY_DOMAIN = "bscse.uiu.ac.bd";            // ভার্সিটির ডোমেইন (ছাত্রদের জন্য)
// ------------------

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // ১. যদি ইমেইলটি অ্যাডমিনের হয়, তবে অনুমতি দিন
      if (user.email === ADMIN_EMAIL) {
        return true;
      }

      // ২. যদি ইমেইলটি ভার্সিটির ডোমেইন হয়, তবে অনুমতি দিন
      if (user.email.endsWith(`@${VARSITY_DOMAIN}`)) {
        return true;
      }

      // ৩. অন্যথায় এরর পেজে পাঠান
      return "/auth-error?error=InvalidEmailDomain";
    },
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;
        // @ts-ignore
        session.user.nickname = user.nickname;
        session.user.role = user.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/auth-error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };