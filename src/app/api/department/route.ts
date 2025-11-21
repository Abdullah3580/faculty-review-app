// src/app/api/department/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching departments" }, { status: 500 });
  }
}