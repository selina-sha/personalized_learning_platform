import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/courses/[courseId]/assignments/[assignmentId]/submit
 * 
 * @summary Handles assignment submission for students
 * 
 * @description Processes file uploads for assignments with strict filename validation. Performs:
 * 1. Student authentication check
 * 2. File presence and filename format validation
 * 3. Assignment existence verification
 * 4. Atomic file replacement in storage
 * 5. Submission record synchronization in database
 * 
 * @param {Request} req - The HTTP request containing multipart form data with a submission file
 * @param {{ params: { courseId: string; assignmentId: string } }} context - Route parameters containing:
 *   - courseId: ID of the course (integer as string)
 *   - assignmentId: ID of the assignment (integer as string)
 * @returns {Promise<NextResponse>} - A JSON response indicating:
 * - Success with { success: true } on successful submission
 * - Error messages with appropriate HTTP status codes for failures
 * 
 * @throws {403} If user is not authenticated as a STUDENT
 * @throws {400} For invalid requests (missing file, filename mismatch)
 * @throws {404} If assignment isn't found or doesn't belong to course
 * @throws {500} For Supabase storage upload failures
 */ 

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
