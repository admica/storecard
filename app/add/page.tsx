import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AddCardForm from './add-card-form'

export default async function AddCardPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { nerdMode: true }
    })

    return <AddCardForm nerdMode={user?.nerdMode || false} />
}
// Trigger redeploy
