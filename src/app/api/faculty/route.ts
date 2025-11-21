// src/app/api/faculty/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { name, department } = json;

    if (!name || !department) {
      return NextResponse.json({ error: "Name and Department required" }, { status: 400 });
    }

    // --- ১. ডুপ্লিকেট চেক লজিক (নতুন) ---
    // আমরা দেখবো এই নাম এবং ডিপার্টমেন্টের কম্বিনেশন আগে থেকে আছে কিনা
    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        AND: [
          { name: { equals: name, mode: "insensitive" } },       // নাম মিলবে (বড়/ছোট হাতের সমস্যা নেই)
          { department: { equals: department, mode: "insensitive" } } // ডিপার্টমেন্ট মিলবে
        ]
      },
    });

    if (existingFaculty) {
      return NextResponse.json(
        { error: "Faculty with this name already exists in this department!" }, 
        { status: 409 } // 409 মানে Conflict
      );
    }
    // ------------------------------------

    const newFaculty = await prisma.faculty.create({
      data: {
        name,
        department,
      },
    });

    return NextResponse.json(newFaculty);
  } catch (error) {
    return NextResponse.json({ error: "Error creating faculty" }, { status: 500 });
  }
}