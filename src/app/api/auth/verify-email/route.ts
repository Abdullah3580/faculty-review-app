import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // ১. টোকেন খোঁজা
    const existingToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    // ২. মেয়াদ চেক
    if (new Date() > existingToken.expires) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    // ৩. ইউজার আপডেট করা
    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.identifier },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { 
        emailVerified: new Date(), // ভেরিফাই টাইম সেট করা হলো
      },
    });

    // ৪. টোকেন ডিলিট করা (যাতে আর ব্যবহার না হয়)
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: "Email verified successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
