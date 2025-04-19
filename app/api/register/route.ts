import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed
import bcrypt from "bcrypt";

/**
 * POST /api/register
 *
 * Registers a new user account with the provided credentials and profile information.
 *
 * Access Control:
 * - Public. No authentication required.
 *
 * Expected JSON body:
 * {
 *   "username": "user123",         // required, must be unique
 *   "email": "user@example.com",   // required, must be unique
 *   "password": "password123",     // required
 *   "firstName": "John",           // required
 *   "lastName": "Doe",             // required
 *   "role": "STUDENT" | "TEACHER"  // required, must be one of the valid roles
 * }
 *
 * Response:
 * - 200 OK: { message: "User registered successfully", user: { id, username } }
 * - 400 Bad Request: Missing fields, invalid role, or duplicate username/email
 * - 500 Internal Server Error: Unexpected failure
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, firstName, lastName, role } = body;

    // Basic input validation
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Ensure role is valid
    const validRoles = ["TEACHER", "STUDENT"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    // Check for existing user by username or email
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

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and persist new user in the database
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

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
