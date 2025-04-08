import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
