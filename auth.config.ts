import type { NextAuthConfig } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            // Add user data including email verification status
            if (session.user?.email) {
                try {
                    const user = await prisma.user.findUnique({
                        where: { email: session.user.email },
                        select: {
                            id: true,
                            emailVerified: true,
                            onboardingComplete: true,
                            subscriptionSelected: true,
                        },
                    })

                    if (user) {
                        session.user.id = user.id
                        session.user.emailVerifiedStatus = user.emailVerified
                        session.user.onboardingComplete = user.onboardingComplete
                        session.user.subscriptionSelected = user.subscriptionSelected

                        // Add subscription data
                        const subscription = await prisma.subscription.findUnique({
                            where: { userId: user.id },
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
                } catch (error) {
                    // Silently fail during build time or when DB is not available
                    console.warn('Session callback database error:', error)
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
            const isEmailVerified = auth?.user?.emailVerifiedStatus
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/add') || nextUrl.pathname.startsWith('/card') || nextUrl.pathname === '/subscribe'
            const isOnVerification = nextUrl.pathname === '/verify-email'
            const isPublic = nextUrl.pathname === '/' || nextUrl.pathname === '/login' || nextUrl.pathname === '/register'

            // If user is logged in but email not verified, redirect to verification
            if (isLoggedIn && !isEmailVerified && !isOnVerification && !isPublic) {
                return Response.redirect(new URL(`/verify-email?email=${encodeURIComponent(auth.user.email || '')}`, nextUrl))
            }

            if (isOnDashboard) {
                if (isLoggedIn && isEmailVerified) return true
                if (isLoggedIn && !isEmailVerified) {
                    return Response.redirect(new URL(`/verify-email?email=${encodeURIComponent(auth.user.email || '')}`, nextUrl))
                }
                return false // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isEmailVerified) {
                // Redirect logged-in verified users away from public pages to dashboard
                if (isPublic) {
                    return Response.redirect(new URL('/dashboard', nextUrl))
                }
            }
            return true
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
