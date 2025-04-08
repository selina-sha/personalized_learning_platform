import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SubmissionListPage({
    params,
}: {
    params: { courseId: string; assignmentId: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") redirect("/login");

    const courseId = parseInt(params.courseId);
    const assignmentId = parseInt(params.assignmentId);

    const submissions = await prisma.assignmentSubmission.findMany({
        where: { courseId, assignmentId },
        include: {
            enrollment: {
                include: {
                    user: true,
                },
            },
        },
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Student Submissions</h1>

            {submissions.length === 0 ? (
                <p className="text-muted-foreground">No submissions yet.</p>
            ) : (
                <ul className="space-y-4">
                    {submissions.map((submission) => {
                        const student = submission.enrollment.user;
                        return (
                            <li
                                key={submission.id}
                                className="border rounded px-4 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                            >
                                <div>
                                    <p className="font-medium">
                                        {student.firstName} {student.lastName} ({student.username})
                                    </p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                                <div className="flex gap-3 mt-3 sm:mt-0">
                                    <Link
                                        href={`/api/files/signed-url?filePath=${encodeURIComponent(
                                            submission.filePath
                                        )}`}
                                        target="_blank"
                                    >
                                        <Button size="sm">Download</Button>
                                    </Link>
                                    <Button size="sm" variant="outline" disabled>
                                        Grade
                                    </Button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
