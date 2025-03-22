import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, firstName, lastName, role } = body;

    // Basic validation
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Check if role is valid
    const validRoles = ["TEACHER", "STUDENT"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Check if username or email is taken
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Username or email already in use." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
      },
    });

    return NextResponse.json({ message: "User registered successfully", user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
