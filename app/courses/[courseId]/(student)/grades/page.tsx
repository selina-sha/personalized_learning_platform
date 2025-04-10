import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";

export default async function CourseGradesPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") redirect("/login");

  const courseId = parseInt(params.courseId);
  const userId = parseInt(session.user.id);

  const assignments = await prisma.assignment.findMany({
    where: { courseId },
    orderBy: { deadline: "asc" },
  });

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { courseId, userId },
  });

  const grades = await prisma.grade.findMany({
    where: { courseId, userId },
  });

  let totalEarned = 0;
  let totalPossible = 0;

  const submissionMap = new Map(submissions.map(s => [s.assignmentId, s]));
  const gradeMap = new Map(grades.map(g => [g.assignmentId, g]));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Your Grades</h1>

      {assignments.map((assignment) => {
        const submitted = submissionMap.has(assignment.id);
        const grade = gradeMap.get(assignment.id);
        totalPossible += assignment.gradePercentage;

        if (grade) {
          totalEarned += grade.grade;
        }

        return (
          <Card key={assignment.id} className="p-4 space-y-1">
            <h2 className="font-semibold text-lg">{assignment.title}</h2>
            {submitted ? (
              grade ? (
                <p className="text-muted-foreground">
                  Grade: {grade.grade.toFixed(1)} / {assignment.gradePercentage}
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Not graded / {assignment.gradePercentage}
                </p>
              )
            ) : (
              <p className="text-muted-foreground italic">
                Not submitted / {assignment.gradePercentage}
              </p>
            )}
          </Card>
        );
      })}

      <hr />
      <p className="text-right font-medium text-muted-foreground">
        Total: {totalEarned.toFixed(1)} / {totalPossible.toFixed(1)}
      </p>
    </div>
  );
}
