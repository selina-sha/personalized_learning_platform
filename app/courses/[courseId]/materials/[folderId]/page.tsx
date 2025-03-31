import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FolderViewer from "./_components/FolderViewer"; // we’ll create this next

export default async function FolderPage({
  params,
}: {
  params: { courseId: string; folderId: string };
}) {
  const session = await getServerSession(authOptions);
  const courseId = parseInt(params.courseId);
  const folderId = parseInt(params.folderId);

  const folder = await prisma.materialFolder.findUnique({
    where: { id: folderId },
    include: {
      children: true,
      files: true,
    },
  });

  if (!folder) {
    return <div className="text-red-500">Folder not found</div>;
  }

  return (
    <FolderViewer
      folder={folder}
      courseId={courseId}
      userRole={session?.user.role}
    />
  );
}
