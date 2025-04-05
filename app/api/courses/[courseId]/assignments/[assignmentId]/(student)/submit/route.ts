import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: Request,
    context: { params: { courseId: string; assignmentId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const userId = Number(session.user.id);
    const courseId = parseInt(context.params.courseId);
    const assignmentId = parseInt(context.params.assignmentId);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
    });

    if (!assignment || assignment.courseId !== courseId) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const expectedFilename = assignment.submissionName;
    if (file.name !== expectedFilename) {
        return NextResponse.json({
            error: `Please upload the file as "${expectedFilename}".`,
        }, { status: 400 });
    }

    const filePath = `courses/${courseId}/assignments/${assignmentId}/submissions/${userId}/${expectedFilename}`;

    // Step 1: Delete previous file
    await supabase.storage.from("course-materials").remove([filePath]);

    // Step 2: Upload file
    const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Step 3: Delete existing DB submission if exists
    await prisma.assignmentSubmission.deleteMany({
        where: {
            assignmentId,
            userId,
        },
    });

    // Step 4: Insert new DB record
    await prisma.assignmentSubmission.create({
        data: {
            assignmentId,
            courseId,
            userId,
            filePath,
        },
    });

    return NextResponse.json({ success: true });
}
