import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddStudentForm from "./AddStudentForm";

export default async function PeoplePage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = parseInt(session.user.id);
  const courseId = parseInt(params.courseId);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: true,
      enrollments: {
        include: { user: true },
      },
    },
  });

  if (!course) redirect("/dashboard");

  const isTeacher = userId === course.teacherId;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">People</h1>

      {isTeacher && <AddStudentForm courseId={courseId} />}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Enrolled Students</h2>
        {course.enrollments.length === 0 ? (
          <p className="text-muted-foreground">No students enrolled yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {course.enrollments.map((enrollment) => (
              <li key={enrollment.user.id} className="border rounded px-3 py-2">
                {enrollment.user.firstName} {enrollment.user.lastName} ({enrollment.user.username})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
