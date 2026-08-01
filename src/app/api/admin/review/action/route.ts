// src/app/api/admin/review/action/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    // ১. Input validation
    if (!reviewId || !action) {
      return NextResponse.json({ error: "Missing reviewId or action" }, { status: 400 });
    }

    // ২. Session check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 });
    }

    // ৩. Admin role check
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRole = user.role ? user.role.trim().toUpperCase() : "";
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You are not an Admin" }, { status: 403 });
    }

    const actionType = action.trim().toLowerCase();

    // ৪. Review এবং faculty info নিয়ে আসা (notification এর জন্য)
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        faculty: { select: { id: true, name: true } },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // ৫. Action অনুযায়ী কাজ করা
    if (actionType === "approve") {
      await prisma.review.update({
        where: { id: reviewId },
        data: { status: "APPROVED" },
      });

      // ✅ Review author কে notification পাঠানো
      await prisma.notification.create({
        data: {
          userId: review.userId,
          type: "REVIEW_APPROVED",
          message: `✅ Your review for ${review.faculty.name} has been approved!`,
          link: `/faculty/${review.faculty.id}`,
          isRead: false,
        },
      });

    } else if (actionType === "reject") {
      // ❌ Delete করার আগে notification পাঠানো
      await prisma.notification.create({
        data: {
          userId: review.userId,
          type: "REVIEW_REJECTED",
          message: `❌ Your review for ${review.faculty.name} was not approved.`,
          link: `/faculty/${review.faculty.id}`,
          isRead: false,
        },
      });

      await prisma.review.delete({
        where: { id: reviewId },
      });

    } else {
      return NextResponse.json({ error: "Invalid action provided" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Action completed successfully" });

  } catch (error: any) {
    console.error("API Action Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}