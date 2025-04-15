import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


/**
 * POST /api/courses/[courseId]/add-student
 *
 * @summary Adds a student to the specified course by courseId.
 * 
 * @description Allows authenticated teachers to add students to courses they own. Performs:
 * 1. Teacher authorization check
 * 2. Course ownership validation
 * 3. Student existence and role verification
 * 4. Duplicate enrollment prevention
 *
 * @param {Request} req - The HTTP request object containing a JSON body with the student's username
 * @param {{ params: { courseId: string } }} context - Route parameters containing the course ID as a string
 * @returns {Promise<NextResponse>} - A JSON response containing either:
 * - The enrolled student's details (ID, username, first/last name) on success
 * - An error message with appropriate HTTP status code for failures
 * 
 * @throws {403} If user is not authenticated as a TEACHER or doesn't own the course
 * @throws {404} If student isn't found or has invalid role
 * @throws {400} If student is already enrolled in the course
 */

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

  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Student is already enrolled." }, { status: 400 });
  }

  await prisma.courseEnrollment.create({
    data: {
      userId: student.id,
      courseId,
    },
  });

  return NextResponse.json({
    student: {
      id: student.id,
      username: student.username,
      firstName: student.firstName,
      lastName: student.lastName,
    },
  });


  return NextResponse.json({ success: true });
}
