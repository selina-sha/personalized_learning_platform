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

  const folderPath = await getFolderPath(folderId);
  console.log(folderPath)

  return (
    <FolderViewer
      folder={folder}
      folderPath={folderPath}
      courseId={courseId}
      userRole={session?.user.role}
    />
  );
}

async function getFolderPath(folderId: number) {
    const path: { id: number; name: string }[] = [];
    let current = await prisma.materialFolder.findUnique({
      where: { id: folderId },
      select: { id: true, name: true, parentId: true },
    });
  
    while (current) {
      path.unshift({ id: current.id, name: current.name });
  
      if (!current.parentId) break;
  
      current = await prisma.materialFolder.findUnique({
        where: { id: current.parentId },
        select: { id: true, name: true, parentId: true },
      });
    }
  
    return path;
  }
  
