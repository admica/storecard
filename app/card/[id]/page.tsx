import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteCard } from '@/app/lib/actions'
import CardView from './card-view'

export default async function CardPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/login')
    }

    const card = await prisma.card.findUnique({
        where: { id: params.id },
        include: { user: true },
    })

    if (!card || card.user.email !== session.user.email) {
        notFound()
    }

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <header className="flex items-center justify-between bg-gray-50 px-4 py-4 shadow-sm">
                <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    &larr; Back
                </Link>
                <h1 className="text-lg font-bold text-gray-900">{card.retailer}</h1>
                <div className="flex space-x-4">
                    <Link
                        href={`/card/${card.id}/edit`}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                        Edit
                    </Link>
                    <form action={deleteCard.bind(null, card.id)}>
                        <button type="submit" className="text-sm text-red-600 hover:text-red-500">
                            Delete
                        </button>
                    </form>
                </div>
            </header>

            <CardView card={card} />
        </div>
    )
}
