// src/app/api/messages/[conversationId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;

  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;
  if (!myId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // আমি এই conversation-এর অংশগ্রহণকারী কিনা
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: myId } },
  });
  if (!participant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: { id: true, content: true, createdAt: true, senderId: true },
  });

  // পড়া হয়েছে বলে চিহ্নিত করো
  await prisma.conversationParticipant.update({
    where: { id: participant.id },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ messages });
}