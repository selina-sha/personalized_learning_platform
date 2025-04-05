import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { fileId, filePath } = await req.json();

  if (!fileId || !filePath) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { error: storageError } = await supabase
    .storage
    .from("course-materials")
    .remove([filePath]);

  if (storageError) {
    console.error("Supabase delete error:", storageError.message);
    return NextResponse.json({ error: "Failed to delete from storage" }, { status: 500 });
  }

  await prisma.materialFile.delete({
    where: { id: fileId },
  });

  return NextResponse.json({ success: true });
}
