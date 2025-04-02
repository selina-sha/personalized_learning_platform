import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CourseHomePage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const courseId = parseInt(params.courseId);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { teacher: true },
  });

  if (!course) redirect("/dashboard");

  const isTeacher = parseInt(session.user.id) === course.teacherId;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{course.name}</h1>

      <div className="space-y-2 text-sm">
        <p>
          <strong>Start:</strong> {new Date(course.startTime).toLocaleDateString()}
        </p>
        <p>
          <strong>End:</strong> {new Date(course.endTime).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          {course.active ? (
            <span className="text-green-600 font-medium">Active</span>
          ) : (
            <span className="text-red-600 font-medium">Inactive</span>
          )}
        </p>
        <p>
          <strong>Teacher:</strong> {course.teacher.firstName} {course.teacher.lastName}
        </p>
        <p>
          <strong>Contact:</strong> {course.teacher.email}
        </p>
      </div>
      {isTeacher && (
        <Link href={`/courses/${course.id}/edit`}>
          <Button>Edit Course</Button>
        </Link>
      )}

      <div className="space-y-2 pt-4">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-muted-foreground whitespace-pre-line">
          {course.description || "No description provided."}
        </p>
      </div>
    </div>
  );
}
