import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize Supabase client with service role key for full access to private storage bucket
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/courses/[courseId]/materials/upload
 *
 * Uploads a file to Supabase Storage and creates a corresponding MaterialFile record in the database.
 *
 * Access Control:
 * - Only authenticated users can upload files.
 *
 * Request Body (multipart/form-data):
 * - file:      File object to upload (required)
 * - folderId:  ID of the MaterialFolder in the database (required)
 * - filename:  Desired file name to save (required)
 *
 * Response:
 * - 200 OK: { success: true, filePath: string }
 * - 400 Bad Request: Missing one or more required fields
 * - 401 Unauthorized: Not logged in
 * - 500 Internal Server Error: Supabase upload or unexpected error
 */
export async function POST(
    req: Request,
    context: { params: { courseId: string } }
) {
    try {
        // Check for valid session and user ID
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const uploaderId = parseInt(session.user.id);
        const courseId = parseInt(context.params.courseId);

        // Extract form data from request
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folderId = parseInt(formData.get("folderId") as string);
        const fileName = formData.get("filename") as string;

        // Validate input fields
        if (!file || !folderId || !fileName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const path = `courses/${courseId}/folders/${folderId}/${fileName}`;

        // Upload file to Supabase Storage (overwrites existing file if present)
        const { error } = await supabase.storage
            .from("course-materials")
            .upload(path, file, { upsert: true });

        if (error) {
            console.error("Upload error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Create a new MaterialFile entry in the database
        await prisma.materialFile.create({
            data: {
                folderId,
                filename: fileName,
                filePath: path,
                uploadedBy: uploaderId,
            },
        });

        return NextResponse.json({ success: true, filePath: path });
    } catch (e) {
        console.error("Unhandled error during upload:", e);
        return NextResponse.json({ error: "Server crashed" }, { status: 500 });
    }
}
