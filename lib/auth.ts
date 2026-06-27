import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { generateInviteToken } from "@/utils/generate_invite_token";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "your@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const { email, password } = { ...credentials };

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) return null;

        const google_account = await prisma.googleAccount.findUnique({
          where: {
            userId: user.id,
          },
        });

        if (google_account) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            invite_token: user.invite_token || undefined,
            google_refresh_token: google_account.refreshToken || undefined,
            google_access_token: google_account.accessToken,
          };
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          invite_token: user.invite_token || undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user.email) return true;

      const nameParts = (user.name || profile?.name || "Google User").split(" ");
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      const dbUser = existingUser || await prisma.user.create({
        data: {
          email: user.email,
          name: nameParts[0] || "Google",
          lastname: nameParts.slice(1).join(" ") || "User",
          password: await bcrypt.hash(crypto.randomUUID(), 10),
          avatarUrl: user.image,
          invite_token: generateInviteToken(),
        },
      });

      user.id = dbUser.id;
      user.lastname = dbUser.lastname;
      user.invite_token = dbUser.invite_token || undefined;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.lastname = user.lastname;
        token.invite_token = user.invite_token;

        token.google_access_token = user.google_access_token || account?.access_token;
        token.google_refresh_token = user.google_refresh_token || account?.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.lastname = token.lastname as string;
        session.user.invite_token =
          typeof token.invite_token === "string" ? token.invite_token : undefined;

        session.user.google_access_token =
          typeof token.google_access_token === "string"
            ? token.google_access_token
            : undefined;
        session.user.google_refresh_token =
          typeof token.google_refresh_token === "string"
            ? token.google_refresh_token
            : undefined;
      }

      return session;
    },
  },
};
