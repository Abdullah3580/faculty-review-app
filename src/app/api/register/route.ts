import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid"; // টোকেন তৈরির জন্য
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, nickname, studentId, email, password } = await request.json();

    if (!name || !nickname || !studentId || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // ডুপ্লিকেট চেক
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { studentId }, { nickname }] }
    });

    if (exists) {
      return NextResponse.json({ error: "User already exists with this Email, ID or Nickname" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ১. ইউজার তৈরি (কিন্তু ভেরিফাইড না)
    await prisma.user.create({
      data: {
        name,
        nickname,
        studentId,
        email,
        password: hashedPassword,
        role: "STUDENT",
        emailVerified: null, // এখন null থাকবে
      },
    });

    // ২. টোকেন তৈরি
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // ২৪ ঘণ্টা মেয়াদ

    // ৩. টোকেন ডাটাবেসে সেভ করা
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // ৪. ইমেইল পাঠানো
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Success! Please check your email to verify." });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}