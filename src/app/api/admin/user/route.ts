// src/app/api/admin/user/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  
  // অ্যাডমিন চেক
  if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await request.json();

  try {
    // ইউজার ডিলিট করলে তার সব রিভিউ, ভোট, প্রশ্ন সব অটোমেটিক ডিলিট হয়ে যাবে (Cascade অন করা আছে)
    await prisma.user.delete({
      where: { id: userId },
    });
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}