import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ids, data } = await req.json();
    
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    // বাল্ক আপডেট কুয়েরি
    const result = await prisma.faculty.updateMany({
      where: {
        id: { in: ids },
      },
      data: data,
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error("Bulk update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}