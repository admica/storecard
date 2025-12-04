import type { NextAuthConfig } from 'next-auth'
import { prisma } from '@/lib/prisma'

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            // Use data from JWT token instead of querying database
            // This allows the session callback to run on Edge Runtime
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.emailVerifiedStatus = token.emailVerified as boolean
                session.user.onboardingComplete = token.onboardingComplete as boolean
                session.user.subscriptionSelected = token.subscriptionSelected as boolean

                if (token.subscription) {
                    session.user.subscription = token.subscription as any
                }
            }

            return session
        },
        async jwt({ token, user, trigger }) {
            // Add user data to token on sign in
            if (user) {
                token.id = user.id
                token.emailVerified = (user as any).emailVerified
                token.onboardingComplete = (user as any).onboardingComplete
                token.subscriptionSelected = (user as any).subscriptionSelected
            }

            // Refresh user data from database when needed
            // This runs server-side only, not in middleware
            if (trigger === 'update' && token.email) {
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email },
                        select: {
                            id: true,
                            emailVerified: true,
                            onboardingComplete: true,
                            subscriptionSelected: true,
                        },
                    })

                    if (dbUser) {
                        token.id = dbUser.id
                        token.emailVerified = dbUser.emailVerified
                        token.onboardingComplete = dbUser.onboardingComplete
                        token.subscriptionSelected = dbUser.subscriptionSelected

                        // Add subscription data
                        const subscription = await prisma.subscription.findUnique({
                            where: { userId: dbUser.id },
                            select: {
                                tier: true,
                                status: true,
                                currentPeriodEnd: true,
                            },
                        })

                        if (subscription) {
                            token.subscription = {
                                tier: subscription.tier,
                                status: subscription.status,
                                currentPeriodEnd: subscription.currentPeriodEnd,
                                isActive: subscription.status === 'ACTIVE',
                                isFree: subscription.tier === 'FREE',
                            }
                        }
                    }
                } catch (error) {
                    console.warn('JWT callback database error:', error)
                }
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
