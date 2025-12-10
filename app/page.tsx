import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
    const session = await auth()
    if (session?.user) {
        if (session.user.subscriptionSelected) {
            redirect('/dashboard')
        } else {
            redirect('/subscribe')
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
                            <span className="sr-only">StoreCard</span>
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-lg font-bold shadow-md">
                                S
                            </div>
                            <span className="text-xl font-bold text-primary">StoreCard</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 justify-end items-center gap-4">
                        <Link 
                            href="/login" 
                            className="text-sm font-semibold text-primary hover:text-accent transition-colors"
                        >
                            Log in
                        </Link>
                        <Link 
                            href="/register" 
                            className="rounded-xl bg-gradient-to-r from-accent to-accent-light px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] transition-all"
                        >
                            Get started
                        </Link>
                    </div>
                </nav>
            </header>

            <div className="relative isolate px-6 pt-14 lg:px-8 flex-1 flex items-center">
                {/* Background decorations */}
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <div 
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-accent to-accent-light opacity-20 dark:opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                    />
                </div>

                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-accent/10 dark:bg-accent/20 px-4 py-2 text-sm font-medium text-accent">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                            </span>
                            Now available on all devices
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
                            All your loyalty cards
                            <span className="block bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                                in one place
                            </span>
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-muted max-w-xl mx-auto">
                            StoreCard helps you organize and access your store loyalty cards instantly. No more fumbling through your wallet at the checkout.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link 
                                href="/register" 
                                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-accent to-accent-light px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                            >
                                Get started for free
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                            <Link 
                                href="/login" 
                                className="w-full sm:w-auto text-sm font-semibold text-primary hover:text-accent transition-colors flex items-center justify-center gap-2 px-8 py-4"
                            >
                                Already have an account?
                                <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        {/* Feature highlights */}
                        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                            <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
                                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-primary mb-2">Scan & Store</h3>
                                <p className="text-sm text-muted">Quickly scan barcodes or add cards manually with our simple interface.</p>
                            </div>

                            <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
                                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-primary mb-2">Access Anywhere</h3>
                                <p className="text-sm text-muted">Your cards sync across all your devices automatically.</p>
                            </div>

                            <div className="bg-surface dark:bg-surface rounded-2xl p-6 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
                                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-primary mb-2">Secure & Private</h3>
                                <p className="text-sm text-muted">Your data is encrypted and only accessible by you.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                    <div 
                        className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent-light to-accent opacity-20 dark:opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                    />
                </div>
            </div>
        </div>
    )
}
