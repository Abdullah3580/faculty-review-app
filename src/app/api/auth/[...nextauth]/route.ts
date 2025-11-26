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
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please enter Email and Password");
        }

        // ১. ইউজার খোঁজা
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { studentId: email }
            ]
          }
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (!user.password) {
          throw new Error("Please reset your password");
        }

        // 🔥 নতুন চেকপোস্ট: ইমেইল ভেরিফাইড কিনা চেক করা 🔥
        if (!user.emailVerified) {
          throw new Error("Please verify your email first! Check your inbox.");
        }
        // ------------------------------------------------

        // ২. পাসওয়ার্ড চেক করা
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        return user;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.nickname = user.nickname;
        // @ts-ignore
        token.studentId = user.studentId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = token.id as string;
        // @ts-ignore
        session.user.role = token.role as string;
        // @ts-ignore
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
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };