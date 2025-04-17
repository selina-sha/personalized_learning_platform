import ProfilePageClient from "./ProfilePageClient";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const userId = parseInt(session.user?.id);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    });

    if (!user) redirect("/login");

    // Tooltip state must be handled in a client component
    // So, move the profile display to a separate client component
    return <ProfilePageClient user={user} />;
}

