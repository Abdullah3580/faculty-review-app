import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";
// ✅ ১. নতুন ইমপোর্ট
import { validate } from "deep-email-validator";

export async function POST(request: Request) {
  try {
    const { name, nickname, studentId, email, password } = await request.json();

    const validationErrors = [];

    // --- চেকিং শুরু ---

    if (!name || !nickname || !studentId || !email || !password) {
      return NextResponse.json({ errors: ["All fields are required."] }, { status: 400 });
    }

    // ডোমেইন চেক
    if (!email.endsWith("uiu.ac.bd")) {
      validationErrors.push("Use only UIU email.");
    }

    // স্টুডেন্ট আইডি চেক
    if (studentId.length < 10) {
      validationErrors.push("Student ID must be at least 10 digits long.");
    }

    // পাসওয়ার্ড লেন্থ চেক
    if (password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long.");
    }

    // পাসওয়ার্ড স্ট্রেন্থ চেক
    const strongPassword =
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!strongPassword) {
      validationErrors.push("Password must contain: Uppercase, Lowercase, Number & Special char.");
    }

    // ------------------------------------------------------------------------
    // ✅ ২. রিয়েল ইমেইল চেকিং (SMTP Validation) - নতুন অংশ
    // ------------------------------------------------------------------------
    // যদি উপরের সব শর্ত ঠিক থাকে এবং UIU ইমেইল হয়, তখন আমরা চেক করব ইনবক্স আছে কি না
    if (email.endsWith("uiu.ac.bd") && validationErrors.length === 0) {
      
      const res = await validate({
        email: email,
        sender: email, // অনেক সময় sender মেইল সেইম দিলে সার্ভার রেসপন্স ভালো দেয়
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: true, // ⚠️ এটিই আসল চেক (ইনবক্স আছে কি না)
      });

      // যদি মেইল ভ্যালিড না হয়
      if (!res.valid) {
        if (res.reason === "smtp") {
            // ইনবক্স পাওয়া না গেলে এই মেসেজ দেখাবে
            validationErrors.push("এই ইমেইলটি এক্সিস্ট করে না। ভেলিড মেইল দিন।");
        } else if (res.reason === "mx") {
            validationErrors.push("Invalid email domain. Mail server not found.");
        } else {
            validationErrors.push("Invalid email address provided.");
        }
      }
    }
    // ------------------------------------------------------------------------


    // --- যদি কোনো ভ্যালিডেশন এরর থাকে ---
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // 2. ডাটাবেজ ডুপ্লিকেট চেক
    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { studentId }, { nickname }]
      },
    });

    if (exists) {
      const dbErrors = [];
      if (exists.email === email) dbErrors.push("Email already exists.");
      if (exists.studentId === studentId) dbErrors.push("This Student ID already exists.");
      if (exists.nickname === nickname) dbErrors.push("This Nickname already taken. Use different Nickname");
      
      return NextResponse.json({ errors: dbErrors }, { status: 409 });
    }

    // 3. সব ঠিক থাকলে রেজিস্ট্রেশন সম্পন্ন করা
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1
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
    const expires = new Date(Date.now() + 15 * 60 * 1000);
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
      { errors: ["Server error during registration."] }, 
      { status: 500 }
    );
  }
}