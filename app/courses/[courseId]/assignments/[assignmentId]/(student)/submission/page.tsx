import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudentSubmissionPage({
    params,
}: {
    params: { courseId: string; assignmentId: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") redirect("/login");

    const courseId = parseInt(params.courseId);
    const assignmentId = parseInt(params.assignmentId);
    const userId = parseInt(session.user.id);

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { title: true, gradePercentage: true },
    });

    if (!assignment) {
        return <div className="text-red-500">Assignment not found.</div>;
    }

    const submission = await prisma.assignmentSubmission.findUnique({
        where: {
            assignmentId_userId: {
                assignmentId,
                userId,
            },
        },
    });

    if (!submission) {
        return (
            <div className="text-muted-foreground">
                You have not submitted this assignment yet.
            </div>
        );
    }

    const grade = await prisma.grade.findUnique({
        where: {
            assignmentId_userId: {
                assignmentId,
                userId,
            },
        },
    });

    console.log(grade)

    return (
        <div className="max-w-xl space-y-6">
            <h1 className="text-2xl font-bold">{assignment.title} - Submission</h1>

            {/* Status */}
            <section>
                <h2 className="text-lg font-semibold">Status</h2>
                <p className="text-muted-foreground">
                    {grade
                        ? `Graded: ${grade.grade.toFixed(1)} / ${assignment.gradePercentage}`
                        : `Not graded / ${assignment.gradePercentage}`}
                </p>
            </section>

            {/* Comment */}
            <section>
                <h2 className="text-lg font-semibold">Comment</h2>
                <p className="text-muted-foreground">
                    {grade? grade.comment? grade.comment : "No comment for this assignment." : "Not graded yet."}
                </p>
            </section>

            {/* Download */}
            <section>
                <h2 className="text-lg font-semibold">Submitted File</h2>
                <Link
                    href={`/api/files/signed-url?filePath=${encodeURIComponent(submission.filePath)}`}
                    target="_blank"
                >
                    <Button>Download Submission</Button>
                </Link>
            </section>
        </div>
    );
}
