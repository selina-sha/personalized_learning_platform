'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddStudentForm({ courseId }: { courseId: number }) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Adding...");

    const res = await fetch(`/api/courses/${courseId}/add-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (res.ok) {
      setMessage("Student added!");
      setUsername("");
    } else {
      const { error } = await res.json();
      setMessage(error || "Failed to add student.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
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
  );
}
