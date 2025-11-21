// src/app/api/admin/review/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  const { reviewId, action } = await request.json(); 

  try {
    // --- CASE 1: Pending Review ---
    if (action === "approve") {
      // পেন্ডিং রিভিউ অ্যাপ্রুভ (পাবলিশ) করা
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "APPROVED" },
      });
    } 
    else if (action === "reject") {
      // পেন্ডিং রিভিউ রিজেক্ট (ডিলিট) করা
      await prisma.review.delete({
        where: { id: reviewId },
      });
    }

    // --- CASE 2: Reported Review (আপনার নতুন লজিক) ---
    else if (action === "approve_report") {
      // Report সত্য (Approve): তাই রিভিউটি ডিলিট করে দিলাম
      // (Review ডিলিট করলে Report-ও অটোমেটিক ডিলিট হয়ে যাবে Cascade এর কারণে)
      await prisma.review.delete({
        where: { id: reviewId },
      });
    }
    else if (action === "reject_report") {
      // Report মিথ্যা (Reject): তাই শুধু রিপোর্টগুলো ডিলিট করবো, রিভিউ থাকবে
      await prisma.report.deleteMany({
        where: { reviewId: reviewId }
      });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating review" }, { status: 500 });
  }
}