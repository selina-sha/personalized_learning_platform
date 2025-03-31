'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Student = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
};

export default function PeopleClient({
  courseId,
  initialStudents,
  isTeacher,
}: {
  courseId: number;
  initialStudents: Student[];
  isTeacher: boolean;
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Adding...");

    const res = await fetch(`/api/courses/${courseId}/add-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();

    if (res.ok) {
      setStudents((prev) => [...prev, data.student]);
      setUsername("");
      setMessage("Student added!");
    } else {
      setMessage(data.error || "Failed to add student.");
    }
  };

  const handleRemove = async (student: Student) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${student.firstName} ${student.lastName} (${student.username}) from this course?`
    );
    if (!confirmed) return;

    const res = await fetch(`/api/courses/${courseId}/remove-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: student.id }),
    });

    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    } else {
      alert("Failed to remove student.");
    }
  };

  return (
    <div className="space-y-6">
      {isTeacher && (
        <form onSubmit={handleAdd} className="space-y-3 max-w-md">
          <h2 className="text-lg font-semibold">Add Student</h2>
          <Input
            placeholder="Enter student username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Button type="submit">Add</Button>
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Enrolled Students</h2>
        {students.length === 0 ? (
          <p className="text-muted-foreground">No students enrolled yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {students.map((student) => (
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
                    onClick={() => handleRemove(student)}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
