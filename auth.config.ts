import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
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
