//src/app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset email has been sent." });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 3600 * 1000);

    await prisma.passwordResetToken.deleteMany({ where: { email } });

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "Email sent!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}