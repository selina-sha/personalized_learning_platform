import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import AssignmentActions from "./_components/AssignmentActions";

export default async function AssignmentPage({
    params,
}: {
    params: { courseId: string; assignmentId: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const courseId = parseInt(params.courseId);
    const assignmentId = parseInt(params.assignmentId);
    const userRole = session.user.role;

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
    });

    if (!assignment || assignment.courseId !== courseId) {
        return <div className="text-red-500">Assignment not found or mismatched course.</div>;
    }
    const submission = await prisma.assignmentSubmission.findUnique({
        where: {
            assignmentId_userId: {
                assignmentId,
                userId: parseInt(session.user.id),
            },
        },
    });


    const handleEditClick = () => {
        // Placeholder for teacher: Edit assignment
        console.log("Edit Assignment clicked");
    };

    const handleSubmitClick = () => {
        // Placeholder for student: Submit assignment
        console.log("Submit Assignment clicked");
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">{assignment.title}</h1>
                    <p className="text-sm text-muted-foreground">
                        Deadline: {new Date(assignment.deadline).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Grade: {assignment.gradePercentage}%
                    </p>
                </div>

                <AssignmentActions
                    userRole={userRole}
                    hasSubmitted={!!submission}
                    pastDeadline={new Date() > new Date(assignment.deadline)}
                    submissionName={assignment.submissionName}
                    assignmentId={assignment.id}
                    courseId={courseId}
                />
            </div>


            <div>
                <h2 className="text-lg font-semibold">Handout</h2>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {assignment.handout || "No handout provided."}
                </p>
            </div>
        </div>
    );
}
