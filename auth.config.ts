import type { NextAuthConfig } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { SubscriptionStatus, SubscriptionTier } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type SubscriptionPayload = {
    tier: SubscriptionTier
    status: SubscriptionStatus
    currentPeriodEnd: Date | null
    isActive: boolean
    isFree: boolean
}

type ExtendedToken = JWT & {
    id?: string
    emailVerified?: boolean
    onboardingComplete?: boolean
    subscriptionSelected?: boolean
    subscription?: SubscriptionPayload
}

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            // Use data from JWT token instead of querying database
            // This allows the session callback to run on Edge Runtime
            const typedToken = token as ExtendedToken

            if (typedToken && session.user) {
                session.user.id = typedToken.id as string
                session.user.emailVerifiedStatus = typedToken.emailVerified as boolean
                session.user.onboardingComplete = typedToken.onboardingComplete as boolean
                session.user.subscriptionSelected = typedToken.subscriptionSelected as boolean

                if (typedToken.subscription) {
                    session.user.subscription = typedToken.subscription
                }
            }

            return session
        },
        async jwt({ token, user, trigger }) {
            const typedToken = token as ExtendedToken

            // Add user data to token on sign in
            if (user) {
                const userData = user as {
                    id?: string
                    emailVerified?: boolean
                    onboardingComplete?: boolean
                    subscriptionSelected?: boolean
                }
                if (userData.id) {
                    typedToken.id = userData.id
                }
                typedToken.emailVerified = userData.emailVerified
                typedToken.onboardingComplete = userData.onboardingComplete
                typedToken.subscriptionSelected = userData.subscriptionSelected
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
                        typedToken.id = dbUser.id
                        typedToken.emailVerified = dbUser.emailVerified
                        typedToken.onboardingComplete = dbUser.onboardingComplete
                        typedToken.subscriptionSelected = dbUser.subscriptionSelected

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
                            typedToken.subscription = {
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

            return typedToken
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
