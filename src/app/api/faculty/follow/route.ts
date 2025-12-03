import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { facultyId } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // চেক করি ইউজার কি অলরেডি ফলো করছে?
  const existingFollow = await prisma.user.findFirst({
    where: {
      id: user.id,
      followedFaculties: {
        some: { id: facultyId }
      }
    }
  });

  if (existingFollow) {
    // যদি ফলো করা থাকে, তবে আন-ফলো (Unfollow) করবে
    await prisma.user.update({
      where: { id: user.id },
      data: {
        followedFaculties: {
          disconnect: { id: facultyId }
        }
      }
    });
    return NextResponse.json({ message: "Unfollowed", isFollowing: false });
  } else {
    // যদি ফলো না করা থাকে, তবে ফলো (Follow) করবে
    await prisma.user.update({
      where: { id: user.id },
      data: {
        followedFaculties: {
          connect: { id: facultyId }
        }
      }
    });
    return NextResponse.json({ message: "Followed", isFollowing: true });
  }
}