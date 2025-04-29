import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    user: User;
    token: string;
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const response = await fetch(process.env.SERVER_URL + "/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials)
        });

        const responseBody = await response.json();
        if (!response.ok) {
          throw new Error(responseBody.message);
        }

        return responseBody?.user && responseBody?.token ? {
          ...(responseBody.user),
          token: responseBody.token
        } : null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.sub = String(user.userId);
        token.user = user;
        token.token = (user as User & { token: string }).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.token) {
        session.token = token.token;
        session.user = token.user;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
