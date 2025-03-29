'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function EditCourseForm({ course }: { course: any }) {
  const router = useRouter();
  const [description, setDescription] = useState(course.description || "");
  const [startTime, setStartTime] = useState(
    new Date(course.startTime).toISOString().slice(0, 10)
  );
  const [endTime, setEndTime] = useState(
    new Date(course.endTime).toISOString().slice(0, 10)
  );
  const [active, setActive] = useState(course.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/courses/${course.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, startTime, endTime, active }),
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Update failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto mt-12 p-6 border rounded">
      <h1 className="text-2xl font-semibold">Edit Course</h1>

      <div>
        <Label>Name</Label>
        <Input value={course.name} disabled />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input type="date" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <Label>End Date</Label>
          <Input type="date" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <div>
        <Label className="mr-2">Active</Label>
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
      </div>

      <Button type="submit">Save Changes</Button>
    </form>
  );
}
