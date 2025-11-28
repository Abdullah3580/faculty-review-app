// src/app/api/register/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import argon2 from "argon2"; // <-- NEW
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, nickname, studentId, email, password } = await request.json();

    if (!name || !nickname || !studentId || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!email.endsWith("uiu.ac.bd")) {
      return NextResponse.json(
        { error: "Only uiu.ac.bd emails are allowed." },
        { status: 400 }
      );
    }

    if (studentId.length < 10) {
      return NextResponse.json(
        { error: "Invalid Student Id" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const strongPassword =
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!strongPassword) {
      return NextResponse.json(
        { error: "Password must include uppercase, lowercase, number and special character." },
        { status: 400 }
      );
    }

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { studentId }, { nickname }]
      },
    });

    if (exists) {
      return NextResponse.json(
        { error: "User already exists with same email, ID or nickname." },
        { status: 409 }
      );
    }

    // -----------------------------
    // 🔐 Argon2 Hashing (STRONG AF)
    // -----------------------------
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,   // best: hybrid resistant
      memoryCost: 2 ** 16,     // 64MB
      timeCost: 3,             // iterations
      parallelism: 1           // single-thread (server-friendly)
    });

    await prisma.user.create({
      data: {
        name,
        nickname,
        studentId,
        email,
        password: hashedPassword,
        role: "STUDENT",
        emailVerified: null,
      },
    });

    const token = uuidv4();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    await sendVerificationEmail(email, token);

    return NextResponse.json({
      message: "Registration successful. Please verify your email.",
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: "Server error during registration." },
      { status: 500 }
    );
  }
}
