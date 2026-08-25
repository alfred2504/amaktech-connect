import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.string().email(),
          password: z.string().min(8),
        }).safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email.toLowerCase() },
            include: { role: true },
          });
          if (!user || !user.password || !user.role || !user.isActive) return null;

          const valid = await bcrypt.compare(parsed.data.password, user.password);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
          };
        } catch (error) {
          console.error("NextAuth authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export async function auth() {
  return getServerSession(authOptions);
}

export { handler as GET, handler as POST };