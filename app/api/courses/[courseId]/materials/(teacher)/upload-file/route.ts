import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize Supabase client with service role key for full access
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/courses/[courseId]/materials/upload
 *
 * Uploads a material file to Supabase Storage and creates a record in the database.
 *
 * Access: Only users with the "TEACHER" role can use this endpoint.
 *
 * Expects multipart/form-data:
 * - file:       The file blob to upload (required)
 * - folderId:   The ID of the folder in which to save the file (required)
 * - filename:   The desired filename (required)
 *
 * Returns:
 * - 200 OK with { success: true, filePath: string } on success
 * - 400 Bad Request if required fields are missing
 * - 403 Forbidden if the user is not authorized
 * - 500 Internal Server Error if the upload fails
 */
export async function POST(
    req: Request,
    context: { params: { courseId: string } }
) {
    // Authenticate the session and check if the user is a teacher
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string;
    const fileName = formData.get("filename") as string;

    // Validate input
    if (!file || !folderId || !fileName) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const courseId = context.params.courseId;
    const path = `courses/${courseId}/folders/${folderId}/${fileName}`;

    // Step 1: Delete any existing file in Supabase Storage at the same path
    await supabase.storage.from("course-materials").remove([path]);

    // Step 2: Upload the new file with overwrite enabled (upsert)
    const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(path, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Step 3: Delete existing database record for the same filename and folder, if any
    await prisma.materialFile.deleteMany({
        where: {
            folderId: parseInt(folderId),
            filename: fileName,
        },
    });

    // Step 4: Create a new record in the database
    await prisma.materialFile.create({
        data: {
            folderId: parseInt(folderId),
            filename: fileName,
            filePath: path,
            uploadedBy: Number(session.user.id),
        },
    });

    return NextResponse.json({ success: true, filePath: path });
}
