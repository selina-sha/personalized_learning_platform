import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SubmissionListClient from "./SubmissionListClient";

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

    const grades = await prisma.grade.findMany({
        where: { courseId, assignmentId },
    });


    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: { gradePercentage: true },
    });

    return (
        <SubmissionListClient
            submissions={submissions}
            grades={grades}
            courseId={courseId}
            assignmentId={assignmentId}
            maxPoints={assignment? assignment.gradePercentage : 100}
        />
    );
}
