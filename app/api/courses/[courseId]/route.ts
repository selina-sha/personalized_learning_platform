import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const courseId = parseInt(params.courseId);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.teacherId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { description, startTime, endTime, active } = body;

  const updated = await prisma.course.update({
    where: { id: courseId },
    data: {
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      active,
    },
  });

  return NextResponse.json(updated);
}
