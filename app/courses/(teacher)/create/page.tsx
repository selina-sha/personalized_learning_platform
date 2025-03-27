import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <main className="max-w-xl mx-auto mt-16 p-6 bg-muted rounded">
      <h1 className="text-xl font-semibold mb-6">Create a New Course</h1>
      <form action="/api/courses" method="POST" className="space-y-4">
        <div>
          <Label htmlFor="name">Course Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input id="description" name="description" />
        </div>
        <div>
          <Label htmlFor="start">Start Date</Label>
          <Input type="date" id="start" name="startTime" required />
        </div>
        <div>
          <Label htmlFor="end">End Date</Label>
          <Input type="date" id="end" name="endTime" required />
        </div>
        <Button type="submit">Create</Button>
      </form>
    </main>
  );
}
