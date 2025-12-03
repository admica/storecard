import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import EditCardForm from './edit-form'

export default async function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
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

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { nerdMode: true }
    })

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Card</h1>
                    <a href={`/card/${card.id}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                        Cancel
                    </a>
                </div>
                <EditCardForm card={card} nerdMode={user?.nerdMode || false} />
            </div>
        </div>
    )
}
