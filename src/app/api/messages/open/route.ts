// src/app/api/messages/open/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;

  if (!myId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const me = await prisma.user.findUnique({
    where: { id: myId },
    select: { id: true, role: true },
  });

  if (!me || me.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin only" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const toUserId = body?.toUserId;

  if (
    typeof toUserId !== "string" ||
    !toUserId ||
    toUserId === myId
  ) {
    return NextResponse.json(
      { error: "Invalid recipient" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true },
  });

  if (!target) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: myId } } },
        { participants: { some: { userId: toUserId } } },
      ],
    },
    select: { id: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: myId },
            { userId: toUserId },
          ],
        },
      },
      select: { id: true },
    });
  }

  return NextResponse.json({
    conversationId: conversation.id,
  });
}