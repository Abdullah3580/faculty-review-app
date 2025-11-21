// src/app/api/admin/faculty/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  // ১. অ্যাডমিন চেক
  if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // ২. অ্যাকশন নেওয়া
  const { facultyId, action } = await request.json(); // action = "approve" or "reject"

  try {
    if (action === "approve") {
      await prisma.faculty.update({
        where: { id: facultyId },
        data: { status: "APPROVED" },
      });
    } else if (action === "reject") {
      // রিজেক্ট করলে ডাটাবেস থেকে ডিলিট করে দেব, যাতে জঞ্জাল না থাকে
      await prisma.faculty.delete({
        where: { id: facultyId },
      });
    }
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    return NextResponse.json({ error: "Error updating faculty" }, { status: 500 });
  }
}