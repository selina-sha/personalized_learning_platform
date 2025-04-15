import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Creates a new course.
 *
 * - Requires a teacher session.
 * - Expects form data with:
 *   - name (string, required)
 *   - description (string, optional)
 *   - startTime (string in ISO format, required)
 *   - endTime (string in ISO format, required)
 *
 * @param {Request} req - Request with form data.
 * @returns {Promise<NextResponse>} - Redirects to dashboard on success, or returns an error.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await req.formData();
  const name = data.get("name") as string;
  const description = data.get("description") as string;
  const startTime = new Date(data.get("startTime") as string);
  const endTime = new Date(data.get("endTime") as string);

  if (!name || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const course = await prisma.course.create({
      data: {
        name,
        description,
        startTime,
        endTime,
        teacherId: parseInt(session.user.id),
      },
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    return NextResponse.json({ error: "Course creation failed" }, { status: 500 });
  }
}
