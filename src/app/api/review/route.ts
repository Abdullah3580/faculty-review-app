// src/app/api/review/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const bannedWords = ["bad", "worst", "useless", "stupid", "idiot", "fake", "baje", "faltu"]; 

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const json = await request.json();
    const { facultyId, rating, comment, course } = json; // course রিসিভ করছি

    // মডারেশন চেক
    const containsBadWord = bannedWords.some((word) => 
      comment.toLowerCase().includes(word)
    );
    if (containsBadWord) {
      return NextResponse.json({ error: "Inappropriate language used." }, { status: 400 });
    }

    const newReview = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        course: course || "General", // যদি কোর্স না দেয়, তবে General বসবে
        facultyId,
        userId: user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(newReview);
  } catch (error) {
    return NextResponse.json({ error: "Error submitting review" }, { status: 500 });
  }
}