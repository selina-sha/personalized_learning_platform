"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  courseId: number;
  assignment: {
    id: number;
    title: string;
    deadline: Date;
    gradePercentage: number;
    handout: string | null;
  };
};

export default function EditAssignmentForm({ courseId, assignment }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(assignment.title);
  const [deadline, setDeadline] = useState(
    new Date(assignment.deadline).toISOString().slice(0, 16)
  );
  const [grade, setGrade] = useState(assignment.gradePercentage.toString());
  const [handout, setHandout] = useState(assignment.handout || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(
      `/api/courses/${courseId}/assignments/${assignment.id}/edit`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          deadline,
          gradePercentage: parseFloat(grade),
          handout,
        }),
      }
    );

    setLoading(false);

    if (res.ok) {
      router.push(`/courses/${courseId}/assignments/${assignment.id}`);
    } else {
      alert("Failed to update assignment.");
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium">Deadline</label>
        <Input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Grade Percentage</label>
        <Input
          type="number"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
          min={0}
          max={100}
          step={0.1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Handout</label>
        <Textarea
          rows={6}
          value={handout}
          onChange={(e) => setHandout(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Assignment"}
      </Button>
    </form>
  );
}
