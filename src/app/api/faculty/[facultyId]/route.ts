import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: Promise<{ facultyId: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { facultyId } = await params;
    const { name, department, designation, initial, code, email, roomNumber, image } = await req.json();

    const updatedFaculty = await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        name,
        department,
        designation: designation || "Lecturer",
        initial: initial || null,
        code: code || null,
        email: email || null,
        roomNumber: roomNumber || null,
        image: image === "" ? null : image,
      },
    });

    return NextResponse.json(updatedFaculty);
  } catch (error) {
    console.error("[FACULTY_UPDATE_ERROR]:", error);
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { facultyId } = await params;
    await prisma.faculty.delete({ where: { id: facultyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FACULTY_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}