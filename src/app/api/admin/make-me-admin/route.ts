// src/app/api/admin/make-me-admin/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // যে লগইন করে আছে, তাকেই ADMIN বানিয়ে দেবে
  await prisma.user.update({
    where: { email: session.user.email },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({ message: `Success! ${session.user.email} is now an ADMIN.` });
}