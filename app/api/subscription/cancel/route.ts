import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SubscriptionService } from '@/lib/stripe'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await SubscriptionService.cancelSubscription(session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period'
    })
  } catch (error: unknown) {
    console.error('Subscription cancellation failed:', error)
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
