import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function MaterialsRootPage({ params }: { params: { courseId: string } }) {
  const courseId = parseInt(params.courseId);

  const rootFolder = await prisma.materialFolder.findFirst({
    where: {
      courseId,
      parentId: null,
    },
  });

  if (!rootFolder) {
    // Create one if it doesn't exist
    const created = await prisma.materialFolder.create({
      data: {
        courseId,
        name: "Root",
        parentId: null,
      },
    });
    redirect(`/courses/${courseId}/materials/${created.id}`);
  } else {
    redirect(`/courses/${courseId}/materials/${rootFolder.id}`);
  }
}
