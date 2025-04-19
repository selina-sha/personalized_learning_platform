import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * POST /api/courses/[courseId]/materials/create-folder
 *
 * Creates a new material folder under a course.
 *
 * Access: Only users with the "TEACHER" role can call this endpoint.
 * Input JSON:
 * {
 *   "name": "Folder Name",          // required
 *   "parentId": 123                 // optional (for nesting)
 * }
 *
 * Response (201):
 * {
 *   "folder": {
 *     "id": 1,
 *     "name": "Folder Name",
 *     "courseId": 42,
 *     "parentId": null,
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 403 Unauthorized (if user is not a teacher)
 * - 400 Bad Request (if name is missing)
 */
export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
  // Validate session and role
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Extract courseId from params and body from request
  const courseId = parseInt(params.courseId);
  const { name, parentId } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "Missing folder name" }, { status: 400 });
  }

  // Create folder in the database
  const newFolder = await prisma.materialFolder.create({
    data: {
      name,
      courseId,
      parentId: parentId || null,
    },
  });

  return NextResponse.json({ folder: newFolder });
}
