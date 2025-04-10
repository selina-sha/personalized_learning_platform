'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SubmitAssignmentModal from "./SubmitAssignmentModal";

export default function AssignmentActions({
    userRole,
    hasSubmitted,
    deadlinePassed,
    submissionName,
    courseId,
    assignmentId,
}: {
    userRole: "TEACHER" | "STUDENT";
    hasSubmitted: boolean;
    deadlinePassed: boolean;
    submissionName: string;
    courseId: number;
    assignmentId: number;
}) {
    const [showModal, setShowModal] = useState(false);
    const router = useRouter();

    const handleSubmitClick = () => {
        if (hasSubmitted) {
            setShowModal(true);
        } else {
            setShowModal(true); // also show modal for first-time submission
        }
    };

    const handleViewSubmission = () => {
        router.push(`/courses/${courseId}/assignments/${assignmentId}/submission`);
      };

    const handleEditClick = () => {
        router.push(`/courses/${courseId}/assignments/${assignmentId}/edit`);
    };

    const handleViewSubmissions = () => {
        console.log("View All Submissions clicked");
    };

    return (
        <div className="flex flex-col items-end gap-2">
            {userRole === "TEACHER" && (
                <>
                    <Button variant="outline" onClick={handleEditClick}>
                        Edit Assignment
                    </Button>
                    <Button variant="secondary" onClick={handleViewSubmissions}>
                        View Submissions
                    </Button>
                </>
            )}

            {userRole === "STUDENT" && (
                <>
                    <Button
                        variant={!deadlinePassed ? "default" : "secondary"}
                        onClick={handleSubmitClick}
                        disabled={deadlinePassed}
                    >
                        {deadlinePassed ? "Deadline Passed" : "Submit Assignment"}
                    </Button>

                    <Button
                        variant={hasSubmitted ? "default" : "secondary"}
                        onClick={handleViewSubmission}
                        disabled={!hasSubmitted}
                    >
                        View My Submission
                    </Button>
                </>
            )}

            {/* Modal */}
            <SubmitAssignmentModal
                open={showModal}
                onClose={() => setShowModal(false)}
                courseId={courseId}
                assignmentId={assignmentId}
                submissionName={submissionName}
                isOverwrite={hasSubmitted}
            />
        </div>
    );
}
