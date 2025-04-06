import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
    context: { params: { courseId: string; assignmentId: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const courseId = parseInt(context.params.courseId);
    const assignmentId = parseInt(context.params.assignmentId);
    const body = await req.json();
    const { title, deadline, gradePercentage, handout } = body;

    if (!title || !deadline || gradePercentage == null) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
        });

        if (!assignment || assignment.courseId !== courseId) {
            return NextResponse.json({ error: "Assignment not found or mismatched course" }, { status: 404 });
        }

        const updated = await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                title,
                deadline: new Date(deadline),
                gradePercentage,
                handout: handout || null,
            },
        });

        return NextResponse.json({ success: true, assignment: updated });
    } catch (err) {
        console.error("Assignment update failed:", err);
        return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
    }
}
