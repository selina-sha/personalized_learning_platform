import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const courseId = parseInt(params.courseId);
  const { name, parentId } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Missing folder name" }, { status: 400 });
  }

  const newFolder = await prisma.materialFolder.create({
    data: {
      name,
      courseId,
      parentId: parentId || null,
    },
  });

  return NextResponse.json({ folder: newFolder });
}
