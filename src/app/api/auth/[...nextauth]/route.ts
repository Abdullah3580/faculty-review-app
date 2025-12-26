// src/app/api/auth/[...nextauth]/route.ts

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

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { studentId: email }],
          },
        });

        if (!user) throw new Error("User not found");
        if (!user.password) throw new Error("Please reset your password");

        if (!user.emailVerified) {
          throw new Error("Please verify your email first! Check your inbox.");
        }

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
      if (token && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (!dbUser) {
          // @ts-ignore
          session.error = "UserDeleted";
          return session;
        }

        if (session.user) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.nickname = dbUser.nickname;
          // @ts-ignore
          session.user.studentId = dbUser.studentId;
        }
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