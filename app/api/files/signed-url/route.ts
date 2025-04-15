import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/files/signed-url
 * 
 * @summary Generates a time-limited access URL for protected files
 * @description
 * 1. Validates presence of filePath query parameter
 * 2. Generates signed URL with 60-second expiration
 * 3. Handles Supabase storage errors
 * 4. Redirects client to temporary access URL
 * 
 * @param {NextRequest} req - Incoming request with filePath query parameter
 * @returns {Promise<NextResponse>} - Response with:
 * - Redirect to signed URL (302 status)
 * - Error message with appropriate HTTP status code for failures
 * 
 * @throws {400} Bad Request - Missing filePath parameter
 * @throws {500} Internal Server Error - Failed to generate signed URL
 */ 

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get("filePath");

  if (!filePath) {
    return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
  }

  const { data, error } = await supabase.storage
    .from("course-materials")
    .createSignedUrl(filePath, 60); // expires in 60 seconds

  if (error) {
    console.error("Signed URL error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
