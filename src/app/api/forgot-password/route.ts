
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  console.log("🔥 API Hit: /api/forgot-password"); 

  try {
    const body = await request.json();
    const { email } = body;
    console.log("📩 Email received from frontend:", email); 

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    console.log("👤 User found in DB:", user ? "YES" : "NO"); 

    if (!user) {
      return NextResponse.json(
        { error: "এই ইমেইলটি আমাদের ডাটাবেজে নেই।" }, 
        { status: 404 }
      );
    }

    
    const token = uuidv4();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    console.log("🔑 Token created & saved to DB"); 

    
    console.log("🚀 Attempting to send email...");
    await sendPasswordResetEmail(email, token);
    console.log("✅ Email sent successfully!"); 

    return NextResponse.json({ message: "Reset link sent successfully!" });

  } catch (error: any) {
    
    console.error("❌ SERVER ERROR DETAILS:", error.message); 
    console.error(error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}