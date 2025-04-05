import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CourseAssignmentsPage({ params }: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions);
    const courseId = parseInt(params.courseId);
    const isTeacher = session?.user.role === "TEACHER";

    const assignments = await prisma.assignment.findMany({
        where: { courseId },
        orderBy: { deadline: "asc" },
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Assignments</h1>
                {isTeacher && (
                    <Link href={`/courses/${courseId}/assignments/create`}>
                        <Button>Create Assignment</Button>
                    </Link>
                )}
            </div>

            {assignments.length === 0 ? (
                <p className="text-muted-foreground">No assignments yet.</p>
            ) : (
                <ul className="space-y-4">
                    {assignments.map((assignment) => (
                        <li key={assignment.id} className="border p-4 rounded">
                            <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
                                <h2 className="text-lg font-semibold hover:underline">{assignment.title}</h2>
                            </Link>
                            <p className="text-muted-foreground text-sm">
                                Deadline: {new Date(assignment.deadline).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Grade Weight: {assignment.gradePercentage}%
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
