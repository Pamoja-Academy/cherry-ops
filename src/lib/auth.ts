import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "CEO" | "CREATIVE_DIRECTOR" | "DIRECTOR" | "PRODUCTION" | "MEDIA" | "FINANCE";

declare module "next-auth" {
  interface User {
    role: UserRole;
    avatar_initials: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      avatar_initials: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    avatar_initials: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Keep in sync with secret resolution in src/proxy.ts
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "cherry-ops-secret-2026-contest",
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .get();

        if (!user) return null;
        if (user.password !== credentials.password) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          avatar_initials: user.avatar_initials,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.avatar_initials = (user as { avatar_initials: string }).avatar_initials;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.avatar_initials = token.avatar_initials as string;
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

export function getRoleHome(role: UserRole): string {
  switch (role) {
    case "CEO": return "/dashboard";
    case "CREATIVE_DIRECTOR": return "/events";
    case "DIRECTOR": return "/clients";
    case "PRODUCTION": return "/production";
    case "MEDIA": return "/media";
    case "FINANCE": return "/invoices";
    default: return "/dashboard";
  }
}
