import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import $apiClient from "./api";
import { type AuthResponse, type SessionUser, type UserCredentials } from "./interface";

const millisecondsPerSecond = 1000;
const secondsPerHour = 60 * 60;
const expirationTimeInSeconds = 8 * secondsPerHour;

const loginPath = process.env.NEXT_PUBLIC_NEXTAUTH_URL || "/login";

async function login(credentials: UserCredentials): Promise<SessionUser> {
  if (!credentials?.username || !credentials?.password) {
    throw new Error("Username and password are required");
  }

  try {
    const response = await $apiClient.post<AuthResponse, any>("/login", {
      username: credentials.username,
      password: credentials.password,
    });

    const { user, accessToken, refreshToken } = response.data;
    if (!user || !accessToken) {
      throw new Error("Invalid login response");
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",        
      role: user.role,
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw new Error("Invalid credentials");
  }
}
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  pages: {
    signIn: loginPath,
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "******",
        },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }
        return await login(credentials as UserCredentials);
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: expirationTimeInSeconds,
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      const currentTime = Math.floor(Date.now() / millisecondsPerSecond);
      if (user) {
        token = {
          ...token,
          ...user,
          accessToken: user.accessToken,
          expires: new Date(
            (currentTime + expirationTimeInSeconds) * millisecondsPerSecond,
          ).toISOString(),
        };
      }
      const expiresAt = token.expires ? new Date().getTime() : 0;
      const isExpired = currentTime >= expiresAt / millisecondsPerSecond;

      if (isExpired) {
        return {};
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        firstName: token.firstName,
        lastName: token.lastName,
        email: token.email,
        role: token.role,
        officeId: token.officeId,
        phone: token.phone,
        userOffice: token.userOffice,
        accessToken: token.accessToken,
      } as any
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
};
