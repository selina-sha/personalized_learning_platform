import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EditAssignmentForm from "./EditAssignmentForm";

export default async function EditAssignmentPage({
    params,
}: {
    params: { courseId: string; assignmentId: string };
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "TEACHER") {
        redirect("/login");
    }

    const assignment = await prisma.assignment.findUnique({
        where: { id: parseInt(params.assignmentId) },
    });

    if (!assignment || assignment.courseId !== parseInt(params.courseId)) {
        return <div className="text-red-500">Assignment not found or mismatched course.</div>;
    }

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Edit Assignment</h1>
            <EditAssignmentForm courseId={parseInt(params.courseId)} assignment={assignment} />
        </div>
    );
}
