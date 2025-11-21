// src/app/api/vote/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ইউজার খুঁজে বের করা
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { reviewId, type } = await request.json(); // type হবে "UP" বা "DOWN"

  // আগে ভোট দিয়েছে কিনা চেক করা
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_reviewId: {
        userId: user.id,
        reviewId: reviewId,
      },
    },
  });

  try {
    if (existingVote) {
      // যদি ইউজার একই বাটনে আবার চাপ দেয়, তাহলে ভোট রিমুভ হবে (Toggle)
      if (existingVote.type === type) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        return NextResponse.json({ message: "Vote removed" });
      } else {
        // যদি ভোট চেঞ্জ করে (UP থেকে DOWN বা উল্টো), তাহলে আপডেট হবে
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        return NextResponse.json({ message: "Vote updated" });
      }
    } else {
      // নতুন ভোট দেওয়া
      await prisma.vote.create({
        data: {
          userId: user.id,
          reviewId,
          type,
        },
      });
      return NextResponse.json({ message: "Vote added" });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error voting" }, { status: 500 });
  }
}