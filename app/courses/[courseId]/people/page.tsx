import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PeopleClient from "./PeopleClient";

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
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
  });

  if (!course) redirect("/dashboard");

  const isTeacher = userId === course.teacherId;

    const students = course.enrollments.map((e) => e.user);

    return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold">People</h1>
        <PeopleClient courseId={courseId} initialStudents={students} isTeacher={isTeacher} />
    </div>
    );

}
