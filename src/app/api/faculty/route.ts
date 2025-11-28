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
    
    const { name, department, designation, initial, code } = json;

    if (!name || !department) {
      return NextResponse.json({ error: "Name and Department required" }, { status: 400 });
    }

    
    const existingFaculty = await prisma.faculty.findFirst({
      where: {
        AND: [
          { name: { equals: name, mode: "insensitive" } },       
          { department: { equals: department, mode: "insensitive" } } 
        ]
      },
    });

    if (existingFaculty) {
      return NextResponse.json(
        { error: "Faculty with this name already exists in this department!" }, 
        { status: 409 } 
      );
    }
    

    const newFaculty = await prisma.faculty.create({
      data: {
        name,
        department,
        
        designation: designation || "Lecturer", 
        initial: initial || null,              
        code: code || null,                    
        status: "APPROVED",                     
      },
    });

    return NextResponse.json(newFaculty);
  } catch (error) {
    return NextResponse.json({ error: "Error creating faculty" }, { status: 500 });
  }
}