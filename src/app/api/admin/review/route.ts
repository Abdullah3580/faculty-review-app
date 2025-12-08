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

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating review" }, { status: 500 });
  }
}