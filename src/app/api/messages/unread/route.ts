// D:\Desktop\faculty-review-app\src\app\api\messages\unread\route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;
  if (!myId) {
    return NextResponse.json({ unread: 0 });
  }

  const mine = await prisma.conversationParticipant.findMany({
    where: { userId: myId },
    select: { conversationId: true, lastReadAt: true },
  });

  const counts = await Promise.all(
    mine.map((p) =>
      prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: myId },
          ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
        },
      })
    )
  );

  return NextResponse.json({ unread: counts.reduce((a, b) => a + b, 0) });
}