// src/app/api/faculty/[facultyId]/approve/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ facultyId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { facultyId } = await params;

    if (!facultyId) {
      return NextResponse.json({ error: "ID not found" }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body; 

    console.log(`Processing action: ${action} for ID: ${facultyId}`);

    if (action === "reject") {
      await prisma.faculty.delete({
        where: { id: facultyId },
      });
      
      return NextResponse.json({ message: "Faculty request rejected and deleted successfully" });

    } else {
      const updatedFaculty = await prisma.faculty.update({
        where: { id: facultyId },
        data: { status: "APPROVED" },
      });

      return NextResponse.json(updatedFaculty);
    }

  } catch (error) {
    console.error("Error processing faculty request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}