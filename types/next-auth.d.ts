import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      name: string | undefined | null,
      username: string | undefined,
      role: string | undefined | null,
      gradeId: string | undefined | null,
      image: string | undefined | null,
      bookmarks: string | undefined | null,
      payments: string | undefined | null,
      userModulesPriorities: string | undefined | null,
    } & DefaultSession["user"]
  }
}
