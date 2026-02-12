import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            role?: string
            id?: string
            username?: string
        } & DefaultSession["user"]
    }

    interface User {
        role?: string
        username?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: string
        id?: string
        username?: string
    }
}
