import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Creates a new assignment for a specific course.
 *
 * - Requires a valid teacher session.
 * - Expects the course ID in the URL parameters.
 * - Expects a JSON body with the following fields:
 *   - title (string, required)
 *   - deadline (string in ISO format, required)
 *   - gradePercentage (number, required)
 *   - submissionName (string, required)
 *   - handout (string, optional)
 *
 * @param {Request} req - The HTTP request object containing assignment data.
 * @param {{ params: { courseId: string } }} context - Route parameters with the course ID.
 * @returns {Promise<NextResponse>} - A JSON response with the created assignment on success, or an error response on failure.
 */
export async function POST(
    req: Request,
    context: { params: { courseId: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseId = parseInt(context.params.courseId);
    const body = await req.json();
    const { title, deadline, gradePercentage, handout, submissionName } = body;

    if (!title || !deadline || gradePercentage == null || !submissionName) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const assignment = await prisma.assignment.create({
            data: {
                title,
                deadline: new Date(deadline),
                gradePercentage,
                handout: handout || null,
                submissionName,
                courseId,
            },
        });

        return NextResponse.json({ success: true, assignment });
    } catch (error) {
        console.error("Assignment creation failed:", error);
        return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
    }
}
