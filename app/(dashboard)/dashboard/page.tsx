import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const isTeacher = session.user.role === "TEACHER";

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {isTeacher && (
        <Link href="/courses/create">
          <Button>Create Course</Button>
        </Link>
      )}

      {/* TODO: show courses */}
    </main>
  );
}
