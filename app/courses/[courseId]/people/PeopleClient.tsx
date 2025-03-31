'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  courseId: number;
  students: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  }[];
  isTeacher: boolean;
};

export default function PeopleClient({ courseId, students, isTeacher }: Props) {
  const [list, setList] = useState(students);

  const handleRemove = async (userId: number) => {
    const confirmed = window.confirm("Are you sure you want to remove this student?");
    if (!confirmed) return;

    const res = await fetch(`/api/courses/${courseId}/remove-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setList((prev) => prev.filter((s) => s.id !== userId));
    } else {
      alert("Failed to remove student.");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Enrolled Students</h2>
      {list.length === 0 ? (
        <p className="text-muted-foreground">No students enrolled yet.</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {list.map((student) => (
            <li
              key={student.id}
              className="border rounded px-3 py-2 flex justify-between items-center"
            >
              <div>
                {student.firstName} {student.lastName} ({student.username})
              </div>
              {isTeacher && (
                <Button
                  variant="ghost"
                  className="text-red-600 text-xs"
                  onClick={() => handleRemove(student.id)}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
