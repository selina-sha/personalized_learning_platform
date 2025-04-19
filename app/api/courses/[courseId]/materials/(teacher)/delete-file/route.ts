import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Initialize Supabase client using service role key (for privileged access)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE Material File
 *
 * POST /api/materials/delete
 *
 * Access: Only users with the "TEACHER" role
 *
 * Expected JSON body:
 * {
 *   "fileId": 123,                      // required: ID of the MaterialFile in DB
 *   "filePath": "folder/myfile.pdf"    // required: path in Supabase storage
 * }
 *
 * Success Response (200):
 * {
 *   "success": true
 * }
 *
 * Error Responses:
 * - 403 Unauthorized (if user is not a teacher)
 * - 400 Bad Request (missing fileId or filePath)
 * - 500 Internal Server Error (if Supabase deletion fails)
 */
export async function POST(req: Request) {
  // Check user session and role
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Extract file info from request body
  const { fileId, filePath } = await req.json();

  if (!fileId || !filePath) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Delete file from Supabase Storage
  const { error: storageError } = await supabase
      .storage
      .from("course-materials")
      .remove([filePath]);

  if (storageError) {
    console.error("Supabase delete error:", storageError.message);
    return NextResponse.json({ error: "Failed to delete from storage" }, { status: 500 });
  }

  // Delete file metadata from database
  await prisma.materialFile.delete({
    where: { id: fileId },
  });

  return NextResponse.json({ success: true });
}
