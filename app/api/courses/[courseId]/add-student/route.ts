import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const courseId = parseInt(params.courseId);
  const { username } = await req.json();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.teacherId !== parseInt(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const student = await prisma.user.findUnique({
    where: { username },
  });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await prisma.courseEnrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId,
    },
  });

  return NextResponse.json({ success: true });
}
