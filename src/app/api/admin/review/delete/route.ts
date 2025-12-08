//src/app/api/admin/review/delete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  try {
    const { reviewId, withWarning, warningReason } = await request.json();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { faculty: true } 
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    
    await prisma.review.delete({
      where: { id: reviewId },
    });

    if (withWarning) {
      await prisma.notification.create({
        data: {
          userId: review.userId,
          type: "SYSTEM", 
          message: `⚠️ Your review for ${review.faculty.name} was removed by Admin. Reason: "${warningReason || 'Violation of community guidelines'}".`,
          isRead: false,
        },
      });
    }

    return NextResponse.json({ message: "Review deleted successfully" });

  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}