import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteCard } from '@/app/lib/actions'
import CardView from './card-view'

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/login')
    }

    const card = await prisma.card.findUnique({
        where: { id },
        include: { user: true },
    })

    if (!card || card.user.email !== session.user.email) {
        notFound()
    }

    return (
        <div className="flex min-h-screen flex-col bg-background pb-safe">
            <header className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
                <Link
                    href="/dashboard"
                    className="h-10 w-10 rounded-full glass dark:bg-slate-800/90 dark:backdrop-blur-md flex items-center justify-center text-primary hover:bg-surface/80 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Back to dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>

                <div className="flex space-x-2">
                    <Link
                        href={`/card/${card.id}/edit`}
                        className="h-10 w-10 rounded-full glass dark:bg-slate-800/90 dark:backdrop-blur-md flex items-center justify-center text-primary hover:bg-surface/80 dark:hover:bg-slate-700 transition-colors"
                        aria-label="Edit card"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                    </Link>
                    <form action={deleteCard.bind(null, card.id)}>
                        <button
                            type="submit"
                            className="h-10 w-10 rounded-full glass dark:bg-slate-800/90 dark:backdrop-blur-md flex items-center justify-center text-error hover:bg-error/10 dark:hover:bg-red-900/50 transition-colors"
                            aria-label="Delete card"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </form>
                </div>
            </header>

            <CardView card={card} />
        </div>
    )
}
