// src/app/api/qa/answer/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { questionId, content } = await request.json();

  try {
    const newAnswer = await prisma.answer.create({
      data: {
        content,
        questionId,
        userId: user.id,
      },
    });
    return NextResponse.json(newAnswer);
  } catch (error) {
    return NextResponse.json({ error: "Error posting answer" }, { status: 500 });
  }
}