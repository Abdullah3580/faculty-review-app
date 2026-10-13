import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // গত ৫ মিনিটে active user
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const onlineUsers = await prisma.user.findMany({
    where: {
      lastSeen: { gte: fiveMinutesAgo },
    },
    select: {
      id: true,
      nickname: true,
      email: true,
      role: true,
      lastSeen: true,
    },
    orderBy: { lastSeen: "desc" },
  });

  return NextResponse.json(onlineUsers);
}