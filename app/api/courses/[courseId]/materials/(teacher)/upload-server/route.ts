import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: Request,
    context: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const uploaderId = parseInt(session.user.id);
        const courseId = parseInt(context.params.courseId);

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const folderId = parseInt(formData.get("folderId") as string);
        const fileName = formData.get("filename") as string;

        if (!file || !folderId || !fileName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const path = `courses/${courseId}/folders/${folderId}/${fileName}`;

        const { error } = await supabase.storage
            .from("course-materials")
            .upload(path, file, { upsert: true });

        if (error) {
            console.error("Upload error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

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
