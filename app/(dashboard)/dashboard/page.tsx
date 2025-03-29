import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

type DashboardPageProps = {
  searchParams: {
    filter?: "ALL" | "ACTIVE" | "INACTIVE";
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const isTeacher = session.user.role === "TEACHER";

  const userId = parseInt(session.user.id);
  const role = session.user.role as "TEACHER" | "STUDENT";

  const filter = searchParams.filter ?? "ALL";

  // Base query
  const baseWhere = role === "TEACHER"
    ? { teacherId: userId }
    : { enrollments: { some: { userId } } };

  // Apply activity filter
  const where =
    filter === "ACTIVE"
      ? { ...baseWhere, active: true }
      : filter === "INACTIVE"
      ? { ...baseWhere, active: false }
      : baseWhere;

  const courses = await prisma.course.findMany({
    where,
    orderBy: { startTime: "desc" },
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard</h1>
      {isTeacher && (
        <Link href="/courses/create">
          <Button>Create Course</Button>
        </Link>
      )}
      {/* Filter buttons */}
      <div className="flex gap-2">
        <FilterButton label="All" filter="ALL" current={filter} />
        <FilterButton label="Active" filter="ACTIVE" current={filter} />
        <FilterButton label="Inactive" filter="INACTIVE" current={filter} />
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        {courses.length === 0 && (
          <p className="text-muted-foreground">No courses found for this filter.</p>
        )}
        {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
                <Card key={course.id} className="p-4 space-y-2">
                    <h2 className="text-xl font-semibold">{course.name}</h2>
                    <p className="text-muted-foreground">{course.description}</p>
                    <p className="text-sm text-gray-500">
                    {course.active ? "Active" : "Inactive"}
                    </p>
                    {role === "TEACHER" && (
                    <Button variant="secondary" className="mt-2">
                        Edit Materials
                    </Button>
                    )}
                </Card>
            </Link>
        ))}
      </div>
    </main>
  );
}

function FilterButton({
  label,
  filter,
  current,
}: {
  label: string;
  filter: string;
  current: string;
}) {
  const isActive = current === filter;
  return (
    <a href={`?filter=${filter}`}>
      <Button variant={isActive ? "default" : "outline"}>{label}</Button>
    </a>
  );
}