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


  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { reviewId, type } = await request.json(); 

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
      if (existingVote.type === type) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        return NextResponse.json({ message: "Vote removed" });
      } else {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type },
        });
        return NextResponse.json({ message: "Vote updated" });
      }
    } else {
      await prisma.vote.create({
        data: {
          userId: user.id,
          reviewId,
          type,
        },
      });

     
      if (type === "UP") {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        
        if (review && review.userId !== user.id) {
          try {
            await prisma.notification.create({
              data: {
                userId: review.userId, 
                type: "VOTE",
                message: `👍 Someone liked your review!`,
                link: `/faculty/${review.facultyId}`, 
                isRead: false,
              },
            });
          } catch (notifError) {
            console.error("Notification failed", notifError);
          }
        }
      }

      return NextResponse.json({ message: "Vote added" });
    }
  } catch (error) {
    return NextResponse.json({ error: "Error voting" }, { status: 500 });
  }
}