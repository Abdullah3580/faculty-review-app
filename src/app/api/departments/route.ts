// src/app/api/department/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ডাটাবেজ থেকে সব ডিপার্টমেন্টের নাম নিয়ে আসা
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: {
        name: "asc", // নামের অ্যালফাবেটিক অর্ডারে সাজাবে
      },
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}