import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const course = await prisma.course.findUnique({
    where: { id: parseInt(params.courseId) },
  });

  if (!course) redirect("/dashboard");

  const isStudent = session.user.role === "STUDENT";
  const courseId = params.courseId;

  const links = [
    { name: "Home", href: `/courses/${courseId}` },
    { name: "People", href: `/courses/${courseId}/people` },
    { name: "Assignments", href: `/courses/${courseId}/assignments` },
    { name: "Materials", href: `/courses/${courseId}/materials` },
    ...(isStudent ? [{ name: "Grades", href: `/courses/${courseId}/grades` }] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <div className="bg-primary text-primary-foreground px-6 py-4 text-xl font-semibold flex items-center gap-3">
        <Link href="/dashboard" className="hover:opacity-80">
            <ArrowLeft className="w-5 h-5" />
        </Link>
        {course.name}
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-48 border-r px-4 py-6 bg-muted">
        <nav className="flex flex-col gap-2">
            {links.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className={cn(
                "block px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground text-sm font-medium"
                )}
            >
                {link.name}
            </Link>
            ))}
        </nav>
        </aside>


        {/* Main Content */}
        <div className="flex-1 px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
