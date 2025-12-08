//src/app/api/auth/reset-password/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    
    if (new Date() > existingToken.expires) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
        return NextResponse.json({ 
            error: "Password must contain: Min 8 chars, Uppercase, Lowercase, Number & Special Char." 
        }, { status: 400 });
    }

  
    const hashedPassword = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 3,
        parallelism: 1
    });

    
    await prisma.user.update({
      where: { email: existingToken.email },
      data: { password: hashedPassword },
    });

    
    await prisma.passwordResetToken.delete({ where: { id: existingToken.id } });

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}