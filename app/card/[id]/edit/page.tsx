import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import EditCardForm from './edit-form'
import Link from 'next/link'

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
        <div className="min-h-screen bg-background p-4 pb-24">
            <div className="mx-auto max-w-md rounded-2xl bg-surface dark:bg-surface p-6 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">Edit Card</h1>
                    <Link 
                        href={`/card/${card.id}`} 
                        className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
                <EditCardForm card={card} nerdMode={user?.nerdMode || false} />
            </div>
        </div>
    )
}
