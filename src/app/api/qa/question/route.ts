// src/app/api/qa/question/route.ts
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

  const { facultyId, content } = await request.json();

  try {
    const newQuestion = await prisma.question.create({
      data: {
        content,
        facultyId,
        userId: user.id,
      },
    });
    return NextResponse.json(newQuestion);
  } catch (error) {
    return NextResponse.json({ error: "Error posting question" }, { status: 500 });
  }
}