//src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import argon2 from "argon2";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or ID", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Please enter Email and Password");
        }

        // ইউজার খোঁজা (email অথবা studentId)
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { studentId: email }],
          },
        });

        if (!user) throw new Error("User not found");
        if (!user.password) throw new Error("Please reset your password");

        // ইমেইল ভেরিফাইড কিনা চেক
        if (!user.emailVerified) {
          throw new Error("Please verify your email first! Check your inbox.");
        }

        // 🧪 Argon2-based password verify
        const isValid = await argon2.verify(user.password, password);
        if (!isValid) throw new Error("Invalid password");

        return user;
      },
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
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.nickname = token.nickname;
        // @ts-ignore
        session.user.studentId = token.studentId;
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
