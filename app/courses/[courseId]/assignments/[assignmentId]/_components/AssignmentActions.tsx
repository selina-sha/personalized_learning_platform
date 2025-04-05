'use client';

import { Button } from "@/components/ui/button";

export default function AssignmentActions({
    userRole,
}: {
    userRole: "TEACHER" | "STUDENT";
}) {
    const handleEditClick = () => {
        console.log("Edit Assignment clicked");
    };

    const handleSubmitClick = () => {
        console.log("Submit Assignment clicked");
    };

    const handleDownloadSubmission = () => {
        console.log("Download My Submission clicked");
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
                    <Button onClick={handleSubmitClick}>Submit Assignment</Button>
                    <Button variant="secondary" onClick={handleDownloadSubmission}>
                        Download My Submission
                    </Button>
                </>
            )}
        </div>
    );
}
