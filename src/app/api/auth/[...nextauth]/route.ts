import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import EmailProvider from "next-auth/providers/email";

// --- আপনার ভার্সিটির ডোমেইন ---
const ALLOWED_EMAIL_DOMAIN = "bscse.uiu.ac.bd"; 
// -----------------------------

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
      
      // ডোমেইন চেক (আপনি চাইলে এটি এখন অফ করে রাখতে পারেন সবার জন্য খোলার দিতে চাইলে)
      // যদি শুধুমাত্র ভার্সিটির মেইল এলাউ করতে চান তবে নিচের লাইনটি রাখুন:
      if (user.email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)) {
        return true;
      }
      // আর যদি সবাইকে (যেমন gmail, yahoo) এলাউ করতে চান, তবে উপরের if ব্লকটি মুছে শুধু "return true;" দিন।
      
      return "/auth-error?error=InvalidEmailDomain";
    },
    async session({ session, user }) {
      if (session.user) {
        // @ts-ignore
        session.user.id = user.id;
        // @ts-ignore
        session.user.nickname = user.nickname;
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