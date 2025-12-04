import type { NextAuthConfig } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            // Add subscription data to session
            if (session.user?.id) {
                const subscription = await prisma.subscription.findUnique({
                    where: { userId: session.user.id },
                    select: {
                        tier: true,
                        status: true,
                        currentPeriodEnd: true,
                    },
                })

                if (subscription) {
                    session.user.subscription = {
                        tier: subscription.tier,
                        status: subscription.status,
                        currentPeriodEnd: subscription.currentPeriodEnd,
                        isActive: subscription.status === 'ACTIVE',
                        isFree: subscription.tier === 'FREE',
                    }
                }
            }

            return session
        },
        async jwt({ token, user }) {
            // Add user ID to token
            if (user) {
                token.id = user.id
            }
            return token
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/add') || nextUrl.pathname.startsWith('/card')
            const isPublic = nextUrl.pathname === '/' || nextUrl.pathname === '/login' || nextUrl.pathname === '/register'

            if (isOnDashboard) {
                if (isLoggedIn) return true
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from public pages to dashboard
                if (isPublic) {
                    return Response.redirect(new URL('/dashboard', nextUrl))
                }
            }
            return true
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
