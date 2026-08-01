import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// টাইপ ফিক্স (Promise) - facultyId এর জায়গায় id দেওয়া হলো
interface RouteParams {
  params: Promise<{ id: string }>;
}

// ১. আপডেট (PUT) - PATCH পরিবর্তন করে PUT করা হলো
export async function PUT(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ⚠️ ফিক্স: params কে await করা হলো এবং id নেওয়া হলো
    const { id } = await params;
    const { name, department, image } = await req.json();

    const updatedFaculty = await prisma.faculty.update({
      where: { id: id },
      // ⚠️ ফিক্স: সরাসরি body না দিয়ে নির্দিষ্ট ফিল্ডগুলো পাঠানো হলো
      data: {
        name,
        department,
        image: image === "" ? null : image, // ফাঁকা থাকলে null সেভ হবে
      },
    });
    
    return NextResponse.json(updatedFaculty);
  } catch (error) {
    console.error("[FACULTY_UPDATE_ERROR]:", error); // আসল এররটি টার্মিনালে দেখার জন্য
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
    // ⚠️ ফিক্স: params কে await করা হলো এবং id নেওয়া হলো
    const { id } = await params;

    await prisma.faculty.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FACULTY_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Error deleting" }, { status: 500 });
  }
}