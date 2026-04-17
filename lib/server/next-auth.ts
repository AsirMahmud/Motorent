import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@/lib/server/db";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login/renter",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false;
      if (account.provider !== "google") return false;

      const existingByEmail = await db.user.findUnique({
        where: { email: user.email },
      });

      if (existingByEmail) {
        // Keep existing role rules. Google is for GENERAL users.
        if (existingByEmail.role !== "GENERAL") {
          return false;
        }

        // Only update name + googleId — never touch verificationStatus on login
        await db.user.update({
          where: { id: existingByEmail.id },
          data: {
            fullName: user.name || existingByEmail.fullName,
            googleId: account.providerAccountId,
          },
        });
        return true;
      }

      // New Google user — starts with PENDING so admin can review KYC docs before booking
      await db.user.create({
        data: {
          email: user.email,
          phone: `google-${Date.now()}`,
          fullName: user.name || "Google User",
          role: "GENERAL",
          googleId: account.providerAccountId,
        },
      });

      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      const dbUser = await db.user.findUnique({
        where: { email: token.email },
      });
      if (dbUser) {
        token.userId = dbUser.id;
        token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
