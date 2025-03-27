import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <main className="max-w-xl mx-auto mt-16 p-6 bg-muted rounded">
      <h1 className="text-xl font-semibold mb-6">Create a New Course</h1>
    </main>
  );
}