import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    lastname?: string;
    invite_token?: string;
    google_refresh_token?: string;
    google_access_token?: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      lastname?: string;
      invite_token?: string;
      google_refresh_token?: string;
      google_access_token?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    name?: string | null;
    lastname?: string;
    invite_token?: string;
    google_refresh_token?: string;
    google_access_token?: string;
  }
}
