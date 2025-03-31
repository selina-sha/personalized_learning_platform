'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";


type Student = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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
                className="border rounded px-3 py-2 flex justify-between items-center cursor-pointer hover:bg-accent"
                onClick={() => setSelectedStudent(student)}
                >
                <div>
                    {student.firstName} {student.lastName} ({student.username})
                </div>
                {isTeacher && (
                    <Button
                    variant="ghost"
                    className="text-red-600 text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(student);
                    }}
                    >
                    Remove
                    </Button>
                )}
                </li>
            ))}
            </ul>
        )}
      </div>

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>More info about this student</DialogDescription>
            </DialogHeader>

            {selectedStudent && (
            <div className="space-y-2 text-sm">
                <p><strong>Username:</strong> {selectedStudent.username}</p>
                <p><strong>Email:</strong> {selectedStudent.email}</p>
                <p><strong>First Name:</strong> {selectedStudent.firstName}</p>
                <p><strong>Last Name:</strong> {selectedStudent.lastName}</p>
            </div>
            )}
        </DialogContent>
        </Dialog>

    </div>
  );
}
