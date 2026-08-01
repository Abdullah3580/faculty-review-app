import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // শুধু admin আপলোড করতে পারবে
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (session?.user?.role?.toUpperCase() !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ফাইল টাইপ চেক
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }

    // ফাইল সাইজ চেক (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be under 2MB" }, { status: 400 });
    }

    // ইউনিক ফাইল নাম বানাও
    const ext = file.name.split(".").pop();
    const fileName = `faculty-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storage তে আপলোড
    const { error } = await supabase.storage
      .from("faculty-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Public URL বানাও
    const { data: urlData } = supabase.storage
      .from("faculty-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}