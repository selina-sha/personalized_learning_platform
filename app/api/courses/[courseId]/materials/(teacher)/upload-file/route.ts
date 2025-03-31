import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const userId = parseInt(session.user.id);
  const courseId = parseInt(params.courseId);
  const { folderId, filename, filePath } = await req.json();

  if (!folderId || !filename || !filePath) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const file = await prisma.materialFile.create({
    data: {
      folderId,
      filename,
      filePath,
      uploadedBy: userId,
    },
  });

  return NextResponse.json({ file });
}
