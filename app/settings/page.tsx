import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import NerdModeToggle from './nerd-mode-toggle'
import DarkModeToggle from './dark-mode-toggle'

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { nerdMode: true, darkMode: true }
    })

    return (
        <div className="min-h-screen bg-background pb-24 pt-8 px-4">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-2">Profile</h1>
                <p className="text-muted text-sm mb-8">Manage your account settings</p>

                {/* Profile Card */}
                <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark mb-6 border border-border-light dark:border-border">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-primary">{session.user.name || 'User'}</h2>
                            <p className="text-muted text-sm">{session.user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Appearance Section */}
                <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark mb-6 border border-border-light dark:border-border">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Appearance</h3>
                    <DarkModeToggle initialValue={user?.darkMode || false} />
                </div>

                {/* Preferences Section */}
                <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark mb-6 border border-border-light dark:border-border">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Preferences</h3>
                    <NerdModeToggle initialValue={user?.nerdMode || false} />
                </div>

                {/* Account Section */}
                <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
                    <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">Account</h3>
                    <form
                        action={async () => {
                            'use server'
                            await signOut()
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-error/10 dark:bg-error/20 px-4 py-3.5 text-sm font-semibold text-error hover:bg-error/20 dark:hover:bg-error/30 transition-all text-left flex items-center justify-between group"
                        >
                            <span>Sign out</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* App Version */}
                <p className="text-center text-xs text-muted mt-8">
                    StoreCard v1.0.0
                </p>
            </div>
        </div>
    )
}
