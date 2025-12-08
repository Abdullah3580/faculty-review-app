import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

// 👇 এই লাইনটি পরিবর্তন করা হয়েছে (Absolute Path ব্যবহার করুন)
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

export async function POST(request: Request) { // ⚠️ লক্ষ্য করুন: এখানে PUT এর বদলে POST হবে
  try {
    const session = await getServerSession(authOptions);
    
    // ১. লগইন চেক
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    
    // ২. এডমিন চেক
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await request.json();
    const { reviewId, action } = body;

    console.log("Processing Action:", action, "for Review:", reviewId);

    // ৩. অ্যাকশন অনুযায়ী লজিক
    if (action === "approve") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "APPROVED" },
      });
    } 
    else if (action === "reject") {
      await prisma.review.delete({
        where: { id: reviewId },
      });
    }
    else if (action === "approve_report") {
      await prisma.review.delete({
        where: { id: reviewId },
      });
    }
    else if (action === "reject_report") {
      await prisma.report.deleteMany({
        where: { reviewId: reviewId }
      });
    }

    return NextResponse.json({ message: "Success", success: true });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}