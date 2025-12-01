import { auth, signOut } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function formatRelativeTime(date: Date | null): string {
    if (!date) return 'Never used'

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return date.toLocaleDateString()
}

export default async function Dashboard() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/login')
    }

    const cards = await prisma.card.findMany({
        where: {
            user: {
                email: session.user.email,
            },
        },
        orderBy: {
            lastUsed: 'desc',
        },
    })

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white shadow">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Cards</h1>
                    <form
                        action={async () => {
                            'use server'
                            await signOut()
                        }}
                    >
                        <button
                            type="submit"
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Sign out
                        </button>
                    </form>
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {cards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">No cards</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding a new loyalty card.</p>
                            <div className="mt-6">
                                <Link
                                    href="/add"
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Add Card
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {cards.map((card) => (
                                <Link
                                    key={card.id}
                                    href={`/card/${card.id}`}
                                    className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-lg font-semibold text-gray-900 truncate">
                                                {card.retailer}
                                            </p>
                                            {card.note && (
                                                <p className="mt-1 text-sm text-gray-500 truncate">
                                                    {card.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {card.barcodeValue && (
                                        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-gray-600 bg-gray-50 rounded px-2 py-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                                            </svg>
                                            <span className="truncate">
                                                {card.barcodeValue.slice(0, 12)}...
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatRelativeTime(card.lastUsed)}
                                        </span>
                                        <span className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            View →
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <div className="fixed bottom-6 right-6">
                <Link
                    href="/add"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <span className="sr-only">Add Card</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </Link>
            </div>
        </div>
    )
}
