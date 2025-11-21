// src/app/api/report/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Login required to report" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { reviewId, reason } = await request.json();

  try {
    await prisma.report.create({
      data: {
        reason,
        reviewId,
        userId: user.id,
      },
    });
    return NextResponse.json({ message: "Reported successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error reporting" }, { status: 500 });
  }
}