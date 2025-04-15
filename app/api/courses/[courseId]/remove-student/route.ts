import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/courses/[courseId]/remove-student
 * 
 * @summary Removes a student from a course
 * @description Allows authenticated course owners to delete student enrollments. Performs:
 * 1. Teacher authorization check
 * 2. Course ownership verification
 * 3. Enrollment record deletion
 * 
 * @param {Request} req - HTTP request containing JSON body with student ID
 * @param {{ params: { courseId: string } }} context - Route parameters containing:
 *   - courseId: ID of the course (integer as string)
 * @returns {Promise<NextResponse>} - JSON response indicating:
 * - Success with { success: true }
 * - Error messages with appropriate HTTP status codes
 * 
 * @throws {403} If user is not authenticated as TEACHER or doesn't own course
 */

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    const courseId = parseInt(params.courseId);
    const { userId } = await req.json();
  
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
  
    if (!course || course.teacherId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  
    await prisma.courseEnrollment.delete({
      where: {
        userId_courseId: { userId, courseId },
      },
    });
  
    return NextResponse.json({ success: true });
  }
  
