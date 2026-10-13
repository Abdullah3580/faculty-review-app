// src/app/api/ping/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false });
  }

  await prisma.user.update({
    where: { email: session.user.email },
    data: { lastSeen: new Date() },
  });

  return NextResponse.json({ ok: true });
}