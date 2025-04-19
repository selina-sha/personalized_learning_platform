import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

/**
 * NextAuth configuration object.
 *
 * This sets up:
 * - A credentials-based login system
 * - Prisma adapter for user storage
 * - JWT session strategy
 * - Custom session and JWT token shaping
 */
export const authOptions = {
  // Secret used to sign tokens and cookies
  secret: process.env.NEXTAUTH_SECRET,

  // Use Prisma as the session and user adapter
  adapter: PrismaAdapter(prisma),

  providers: [
    /**
     * Custom credentials provider.
     * Accepts a username and password, and validates them against
     * the hashed password in the database using bcrypt.
     */
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      /**
       * Authorization function to validate login credentials.
       * @param {object} credentials - Submitted username and password.
       * @returns {Promise<object|null>} - Returns user object if valid, null if invalid.
       */
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
            credentials.password,
            user.password
        );

        if (!isValid) return null;

        return user;
      },
    }),
  ],

  // Use stateless JWTs instead of database sessions
  session: {
    strategy: "jwt",
  },

  // Custom route for login page
  pages: {
    signIn: "/login",
  },

  callbacks: {
    /**
     * Modifies the JWT after login.
     * Adds user-specific fields like `id`, `role`, and `username`.
     * Called when a user logs in or JWT is refreshed.
     *
     * @param {object} params - Destructured token and user objects.
     * @returns {object} - The updated JWT token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.username; // Customize as needed
      }
      return token;
    },

    /**
     * Modifies the session object returned to the client.
     * Adds fields like `id`, `role`, and `username` under `session.user`.
     *
     * @param {object} params - Destructured session and token.
     * @returns {object} - The updated session object.
     */
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.name = token.name;
      return session;
    }
  }
};

/**
 * NextAuth API handler.
 * Handles both GET and POST methods for `/api/auth/[...nextauth]`.
 */
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
