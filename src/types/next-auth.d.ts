import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      nickname?: string | null;
      role?: string;
      semester?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nickname?: string | null;
    role?: string;
    semester?: string | null;
  }
}