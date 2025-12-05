//src/app/api/register/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/lib/email";

// ❌ deep-email-validator বাদ দেওয়া হয়েছে (Vercel এ কাজ করে না)

export async function POST(request: Request) {
  try {
    const { name, nickname, studentId, email, password } = await request.json();

    const validationErrors = [];

    // --- ১. ইনপুট ভ্যালিডেশন ---

    if (!name || !nickname || !studentId || !email || !password) {
      return NextResponse.json({ errors: ["All fields are required."] }, { status: 400 });
    }

    if (!email.endsWith("uiu.ac.bd")) {
      validationErrors.push("Use only UIU email.");
    }

    if (studentId.length < 10) {
      validationErrors.push("Student ID must be at least 10 digits long.");
    }

    if (password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long.");
    }

    const strongPassword =
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    if (!strongPassword) {
      validationErrors.push("Password must contain: Uppercase, Lowercase, Number & Special char.");
    }

    // ------------------------------------------------------------------------
    // ✅ ২. রিয়েল ইনবক্স চেকিং (Abstract API দিয়ে)
    // ------------------------------------------------------------------------
    // যদি উপরের সব শর্ত ঠিক থাকে, তখন আমরা API কল করব
    if (email.endsWith("uiu.ac.bd") && validationErrors.length === 0) {
      try {
        const apiKey = process.env.ABSTRACT_API_KEY;

        if (apiKey) {
            // API কল করা হচ্ছে
            const response = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`);
            const data = await response.json();

            // 👇 আপনার দেওয়া JSON ফরম্যাট অনুযায়ী লজিক
            if (data.email_deliverability && data.email_deliverability.status === "UNDELIVERABLE") {
                validationErrors.push("এই ইমেইলটি খুঁজে পাওয়া যায়নি। সঠিক ইমেইল দিন।");
            } 
            
            // ডিসপোজেবল মেইল চেক
            if (data.email_quality && data.email_quality.is_disposable === true) {
                validationErrors.push("ফেক/ডিসপোজেবল মেইল ব্যবহার করা যাবে না।");
            }
        } else {
            console.warn("API Key পাওয়া যায়নি। ভ্যালিডেশন স্কিপ করা হচ্ছে...");
        }

      } catch (err) {
        console.error("Email Validation API Error:", err);
        // API তে সমস্যা হলে আমরা ইউজারকে আটকাবো না
      }
    }
    // ------------------------------------------------------------------------


    // --- যদি কোনো ভ্যালিডেশন এরর থাকে ---
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    // --- ৩. ডাটাবেজ ডুপ্লিকেট চেক ---
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

    // --- ৪. রেজিস্ট্রেশন সম্পন্ন করা ---
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

    // মেইল পাঠানো (Nodemailer)
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