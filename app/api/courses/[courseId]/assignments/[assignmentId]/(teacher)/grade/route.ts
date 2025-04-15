import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * POST/PUT /api/courses/[courseId]/assignments/[assignmentId]/grade
 * 
 * @summary Manages student grade submissions
 * 
 * @description Allows authenticated teachers to:
 * - POST: Create new grade entries
 * - PUT: Update existing grade entries
 * 
 * @param {Request} req - HTTP request containing JSON body with grade data
 * @param {{ params: { courseId: string; assignmentId: string } }} context - Route parameters containing:
 *   - courseId: ID of the course (integer as string)
 *   - assignmentId: ID of the assignment (integer as string)
 * @returns {Promise<NextResponse>} - JSON response indicating:
 * - Success with { success: true }
 * - Error messages with appropriate HTTP status codes
 * 
 * @throws {403} If user is not authenticated as TEACHER
 * @throws {400} For invalid/missing fields in request body
 * @throws {409} (POST only) If grade already exists for student+assignment
 * @throws {500} For database operation failures
 */ 


export async function POST(req: Request, context: { params: { courseId: string; assignmentId: string } }) {
    return handleGrade(req, context, "POST");
}

export async function PUT(req: Request, context: { params: { courseId: string; assignmentId: string } }) {
    return handleGrade(req, context, "PUT");
}

async function handleGrade(req: Request, context: { params: { courseId: string; assignmentId: string } }, method: "POST" | "PUT") {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseId = parseInt(context.params.courseId);
    const assignmentId = parseInt(context.params.assignmentId);
    const { userId, grade, comment } = await req.json();

    if (!userId || grade == null || isNaN(grade)) {
        return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    try {
        if (method === "POST") {
            const existing = await prisma.grade.findUnique({
                where: {
                    assignmentId_userId: {
                        assignmentId,
                        userId,
                    },
                },
            });

            if (existing) {
                return NextResponse.json({ error: "Grade already exists, use PUT to update" }, { status: 409 });
            }

            await prisma.grade.create({
                data: {
                    assignmentId,
                    userId,
                    courseId,
                    grade,
                    comment: comment || null,
                },
            });
        } else {
            await prisma.grade.update({
                where: {
                    assignmentId_userId: {
                        assignmentId,
                        userId,
                    },
                },
                data: {
                    grade,
                    comment: comment || null,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Grade error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
