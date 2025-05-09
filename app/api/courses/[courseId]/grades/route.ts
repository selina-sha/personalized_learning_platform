import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Retrieves assignments and grading information for a specific course for a student.
 *
 * - Requires a valid student session.
 * - Expects the course ID in the URL parameters.
 * - Returns a JSON response containing a list of assignments with additional details:
 *   - Whether each assignment has been submitted.
 *   - Whether it has been graded.
 *   - The grade value, if available.
 *
 * @param {Request} req - The HTTP request object.
 * @param {{ params: { courseId: string } }} context - Route parameters containing the course ID.
 * @returns {Promise<NextResponse>} - A JSON response with the assignments and grading details.
 */
export async function GET(
    req: Request,
    context: { params: { courseId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseId = parseInt(context.params.courseId);
    const userId = parseInt(session.user.id);

    const assignments = await prisma.assignment.findMany({
        where: { courseId },
        select: {
            id: true,
            title: true,
            gradePercentage: true,
        },
    });

    const submissions = await prisma.assignmentSubmission.findMany({
        where: {
            courseId,
            userId,
        },
        select: {
            assignmentId: true,
        },
    });

    const grades = await prisma.grade.findMany({
        where: {
            courseId,
            userId,
        },
        select: {
            assignmentId: true,
            grade: true,
        },
    });

    const submissionMap = new Set(submissions.map((s) => s.assignmentId));
    const gradeMap = new Map(grades.map((g) => [g.assignmentId, g.grade]));

    const result = assignments.map((assignment) => {
        const submitted = submissionMap.has(assignment.id);
        const grade = gradeMap.get(assignment.id);
        return {
            assignmentId: assignment.id,
            title: assignment.title,
            percentage: assignment.gradePercentage,
            submitted,
            graded: grade !== undefined,
            grade,
        };
    });

    return NextResponse.json({ grades: result });
}
