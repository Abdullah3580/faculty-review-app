//src/app/api/admin/review/action/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // ১. বডি রিড করা এবং লগ করা (ডিবাগিংয়ের জন্য)
    const body = await request.json();
    console.log("Admin Action Received:", body); // ভারসেল লগ চেক করতে কাজে লাগবে

    const { reviewId, action } = body;

    // ২. ইনপুট ভ্যালিডেশন
    if (!reviewId || !action) {
      return NextResponse.json({ error: "Missing reviewId or action" }, { status: 400 });
    }

    // ৩. সেশন চেক
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 });
    }

    // ৪. ইউজার এবং এডমিন রোল চেক
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 👇 ডিবাগিং লগ: ডাটাবেসে ঠিক কী আছে তা দেখার জন্য
    console.log(`Checking Role for ${user.email}: Raw DB Role = '${user.role}'`);

    // ⚠️ ফিক্স: trim() ব্যবহার করা হলো স্পেস মুছতে, এবং toUpperCase() বড় হাতের করতে
    // এখন ' Admin ', 'adMin', 'admin' সব কাজ করবে।
    const userRole = user.role ? user.role.trim().toUpperCase() : "";

    if (userRole !== "ADMIN") {
      console.log(`Access Denied. Processed Role: '${userRole}' is not 'ADMIN'`);
      return NextResponse.json({ error: "Forbidden: You are not an Admin" }, { status: 403 });
    }

    // ৫. অ্যাকশন অনুযায়ী ডাটাবেস অপারেশন
    // action.toLowerCase() ব্যবহার করা হলো যাতে কেস সেন্সিটিভ সমস্যা না হয়
    const actionType = action.trim().toLowerCase();

    if (actionType === "approve") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "APPROVED" },
      });
    } 
    else if (actionType === "reject") {
      // রিজেক্ট হলে রিভিউ ডিলিট হবে
      await prisma.review.delete({
        where: { id: reviewId },
      });
    }
    else {
      return NextResponse.json({ error: "Invalid action provided" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Action completed successfully" });

  } catch (error: any) {
    console.error("API Action Error:", error);
    
    // ⚠️ ফিক্স: এরর অবজেক্ট সরাসরি না পাঠিয়ে, error.message পাঠানো হচ্ছে
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}