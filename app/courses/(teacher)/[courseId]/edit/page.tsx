import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import EditCourseForm from "./EditCourseForm";

export default async function CourseEditPage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  const courseId = parseInt(params.courseId);
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || course.teacherId !== parseInt(session.user.id)) {
    notFound();
  }

  return <EditCourseForm course={course} />;
}
