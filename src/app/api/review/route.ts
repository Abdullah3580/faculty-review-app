// src/app/api/review/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { z } from "zod";

const bannedWords = ["bad", "worst", "useless", "stupid", "idiot", "fake", "baje", "faltu", "gali"];

const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(5).max(500),
  course: z.string().max(20).optional(),
  facultyId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized! Please login first." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const json = await request.json();
    const validation = reviewSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data! Comment must be 5-500 chars & Rating 1-5." },
        { status: 400 }
      );
    }

    const { facultyId, rating, comment, course } = validation.data;

    // Spam Check
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: fiveMinutesAgo,
        },
      },
    });

    if (recentReview) {
      return NextResponse.json(
        { error: "Please wait 5 minutes before posting another review! ⏳" },
        { status: 429 }
      );
    }

    // Moderation Check
    const containsBadWord = bannedWords.some((word) =>
      comment.toLowerCase().includes(word)
    );

    if (containsBadWord) {
      return NextResponse.json(
        { error: "Review contains inappropriate language. Please be respectful. 🚫" },
        { status: 400 }
      );
    }

    // Save Review
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        course: course ? course.toUpperCase() : "GENERAL",
        facultyId,
        userId: user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error("Review Error:", error);
    return NextResponse.json({ error: "Error submitting review" }, { status: 500 });
  }
}
