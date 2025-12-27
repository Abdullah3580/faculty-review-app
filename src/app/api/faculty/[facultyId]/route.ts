import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// টাইপ ফিক্স (Promise)
interface RouteParams {
  params: Promise<{ facultyId: string }>;
}

// ১. আপডেট (PATCH)
export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ⚠️ ফিক্স: params কে await করা হলো
    const { facultyId } = await params;
    const body = await req.json();

    const updatedFaculty = await prisma.faculty.update({
      where: { id: facultyId },
      data: body,
    });
    return NextResponse.json(updatedFaculty);
  } catch (error) {
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

// ২. ডিলেট (DELETE)
export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ⚠️ ফিক্স: params কে await করা হলো
    const { facultyId } = await params;

    await prisma.faculty.delete({ where: { id: facultyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}