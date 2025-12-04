import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data
                    const user = await prisma.user.findUnique({ where: { email } })
                    if (!user) return null

                    // Check if email is verified before allowing login
                    if (!user.emailVerified) {
                        // Return user but they'll be blocked by authorization logic
                        // This allows the session to be created but access will be restricted
                        return { ...user, emailVerified: false }
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    if (passwordsMatch) return user
                }

                return null
            },
        }),
    ],
})
