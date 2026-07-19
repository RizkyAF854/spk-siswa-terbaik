import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        console.log("[AUTH] authorize called with:", credentials?.username, credentials?.role);
        if (!credentials?.username || !credentials?.password || !credentials?.role) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string },
          });

          console.log("[AUTH] User found:", user ? user.username : "NOT FOUND");

          if (!user) return null;

          if (user.role !== credentials.role) {
            console.log(`[AUTH] Role mismatch: db has ${user.role}, requested ${credentials.role}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log("[AUTH] Password valid:", isPasswordValid);

          if (!isPasswordValid) return null;

          return {
            id: user.id,
            name: user.nama,
            email: user.username,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH] Error during authorize:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
