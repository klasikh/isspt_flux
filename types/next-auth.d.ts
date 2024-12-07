import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      name: string | undefined | null,
      username: string | undefined,
      image: string | undefined,
      role: string | undefined | null,
      bookmarks: any | undefined | null,
      payments: any | undefined | null,
      userModulesPriorities: any | undefined,
    } & DefaultSession["user"]
  }
}
