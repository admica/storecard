import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SubscriptionService } from '@/lib/stripe'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(session.user.id)

    return NextResponse.json(subscriptionStatus)
  } catch (error: unknown) {
    console.error('Failed to get subscription status:', error)
    const message = error instanceof Error ? error.message : 'Failed to get subscription status'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
