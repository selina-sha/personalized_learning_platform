'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateAssignmentPage({ params }: { params: { courseId: string } }) {
    const courseId = parseInt(params.courseId);
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [deadline, setDeadline] = useState("");
    const [grade, setGrade] = useState("");
    const [handout, setHandout] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/courses/${courseId}/assignments/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                deadline,
                gradePercentage: parseFloat(grade),
                handout,
            }),
        });

        setLoading(false);

        if (res.ok) {
            router.push(`/courses/${courseId}/assignments`);
        } else {
            alert("Failed to create assignment");
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Create Assignment</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div>
                    <label className="block text-sm font-medium">Deadline</label>
                    <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
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
                        required
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Assignment"}
                </Button>
            </form>
        </div>
    );
}
