//src\app\api\auth\[...nextauth]\route.ts"
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // ১. ইনপুট চেক
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const identifier = credentials.email; // এখানে email বা studentId আসবে

        // ২. ইউজার খোঁজা (ইমেইল অথবা স্টুডেন্ট আইডি দিয়ে)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { studentId: identifier }
            ]
          }
        });

        // ৩. ইউজার না পাওয়া গেলে বা পাসওয়ার্ড না থাকলে
        if (!user || !user.password) {
          console.log("❌ User not found or password missing");
          throw new Error("User not found or password not set");
        }

        c
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
        // @ts-ignore
        token.studentId = user.studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.nickname = token.nickname as string;
        // @ts-ignore
        session.user.studentId = token.studentId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  // ডিবাগিং অন রাখা হলো সমস্যা দেখার জন্য
  debug: true,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };