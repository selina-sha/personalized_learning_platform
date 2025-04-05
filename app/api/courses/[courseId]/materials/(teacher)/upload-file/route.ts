import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request, context: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderId = formData.get("folderId") as string;
    const fileName = formData.get("filename") as string;

    if (!file || !folderId || !fileName) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const courseId = context.params.courseId;
    const path = `courses/${courseId}/folders/${folderId}/${fileName}`;

    // Step 1: Delete any existing Supabase object with same path
    await supabase.storage.from("course-materials").remove([path]);

    // Step 2: Upload new file (overwrite = upsert)
    const { error: uploadError } = await supabase.storage
        .from("course-materials")
        .upload(path, file, { upsert: true });

    if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Step 3: Remove old DB entry if exists
    await prisma.materialFile.deleteMany({
        where: {
            folderId: parseInt(folderId),
            filename: fileName,
        },
    });

    // Step 4: Create new record
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
