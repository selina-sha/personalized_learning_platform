'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GradeModal from "./GradeModal";

type Submission = {
    id: number;
    filePath: string;
    enrollment: { user: Student };
};

type Grade = {
    userId: number;
    grade: number;
};

export default function SubmissionListClient({
    submissions,
    grades,
    courseId,
    assignmentId,
    maxPoints,
}: {
    submissions: Submission[];
    grades: Grade[];
    courseId: number;
    assignmentId: number;
    maxPoints: number;
}) {
    const [gradingStudent, setGradingStudent] = useState<Student | null>(null);
    const [gradesState, setGradesState] = useState(grades);


    const handleGradeSubmit = async (grade: number, comment: string) => {
        if (!gradingStudent) return;

        const existing = gradesState.find((g) => g.userId === gradingStudent.id);
        const method = existing ? "PUT" : "POST";

        await fetch(`/api/courses/${courseId}/assignments/${assignmentId}/grade`, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: gradingStudent.id,
                grade,
                comment,
            }),
        });

        setGradesState((prev) => {
            const updated = prev.filter((g) => g.userId !== gradingStudent.id);
            return [...updated, { userId: gradingStudent.id, grade }];
        });

        setGradingStudent(null);
    };


    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Student Submissions</h1>

            {submissions.length === 0 ? (
                <p className="text-muted-foreground">No submissions yet.</p>
            ) : (
                <ul className="space-y-4">
                    {submissions.map((submission) => {
                        const student = submission.enrollment.user;
                        const grade = gradesState.find((g) => g.userId === student.id);

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

                                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                                    <Link
                                        href={`/api/files/signed-url?filePath=${encodeURIComponent(
                                            submission.filePath
                                        )}`}
                                        target="_blank"
                                    >
                                        <Button size="sm">Download</Button>
                                    </Link>
                                    <Button size="sm" onClick={() => setGradingStudent(student)}>
                                        {grade ? "Regrade" : "Grade"}
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {grade ? `${grade.grade.toFixed(1)} / ${maxPoints}` : "Not graded"}
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <GradeModal
                open={!!gradingStudent}
                onClose={() => setGradingStudent(null)}
                studentName={
                    gradingStudent ? `${gradingStudent.firstName} ${gradingStudent.lastName}` : ""
                }
                maxPoints={maxPoints}
                onSubmit={handleGradeSubmit}
            />
        </div>
    );
}
