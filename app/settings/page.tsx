import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-10 px-4">
            <h1 className="text-3xl font-bold text-primary mb-8">Profile</h1>

            <div className="bg-surface rounded-2xl p-6 card-shadow space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold">
                        {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-primary">{session.user.name || 'User'}</h2>
                        <p className="text-muted text-sm">{session.user.email}</p>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <form
                        action={async () => {
                            'use server'
                            await signOut()
                        }}
                    >
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors text-left flex items-center justify-between"
                        >
                            <span>Sign out</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
