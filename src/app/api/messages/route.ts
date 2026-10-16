// src/app/api/messages/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;
  if (!myId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const text = typeof body?.content === "string" ? body.content.trim() : "";
  if (!text || text.length > 2000) {
    return NextResponse.json(
      { error: "Message must be 1-2000 characters." },
      { status: 400 }
    );
  }

  const me = await prisma.user.findUnique({
    where: { id: myId },
    select: { id: true, role: true },
  });
  if (!me) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isAdmin = me.role?.toUpperCase() === "ADMIN";

  // কার সাথে কথা হবে
  let otherId: string;

  if (isAdmin) {
    const toUserId = body?.toUserId;
    if (typeof toUserId !== "string" || toUserId === myId) {
      return NextResponse.json({ error: "Invalid recipient." }, { status: 400 });
    }
    const target = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    otherId = target.id;
  } else {
    // Student: সবসময় admin-এর কাছেই যাবে (ধাপ ১-এর নিয়ম)
    const admin = await prisma.user.findFirst({
      where: { role: { equals: "ADMIN", mode: "insensitive" } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });
    if (!admin) {
      return NextResponse.json({ error: "No admin available." }, { status: 503 });
    }
    otherId = admin.id;
  }

  // এই দুজনের মধ্যে আগের conversation আছে কিনা
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: myId } } },
        { participants: { some: { userId: otherId } } },
      ],
    },
    select: { id: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: { create: [{ userId: myId }, { userId: otherId }] },
      },
      select: { id: true },
    });
  }

  const message = await prisma.message.create({
    data: { content: text, conversationId: conversation.id, senderId: myId },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message, conversationId: conversation.id });
}
export async function GET() {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;
  if (!myId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const viewerIsAdmin = session?.user?.role?.toUpperCase() === "ADMIN";

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: myId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, nickname: true, role: true } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const result = await Promise.all(
    conversations.map(async (c) => {
      const mine = c.participants.find((p) => p.userId === myId);
      const other = c.participants.find((p) => p.userId !== myId)?.user;
      const unread = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: myId },
          ...(mine?.lastReadAt ? { createdAt: { gt: mine.lastReadAt } } : {}),
        },
      });
      return {
        id: c.id,
        updatedAt: c.updatedAt,
        other: other
          ? {
              id: other.id,
              nickname: other.nickname,
              role: other.role,
              name: viewerIsAdmin ? other.name : undefined,
            }
          : null,
        lastMessage: c.messages[0] ?? null,
        unread,
      };
    })
  );

  return NextResponse.json({ conversations: result });
}