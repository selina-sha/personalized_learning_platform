import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * Updates course details.
 *
 * - Requires a valid teacher session.
 * - Expects the course ID in the route parameters (destructured as { params }).
 * - Validates that the course exists and belongs to the authenticated teacher.
 * - Expects a JSON body with:
 *   - description (string, optional)
 *   - startTime (string in ISO format, required)
 *   - endTime (string in ISO format, required)
 *   - active (boolean, required)
 * - Returns the updated course data as JSON.
 *
 * @param {Request} req - The HTTP request containing the updated course data.
 * @param {{ params: { courseId: string } }} - An object containing the route parameters, including the course ID.
 * @returns {Promise<NextResponse>} - A JSON response with the updated course data, or an error response.
 */
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
