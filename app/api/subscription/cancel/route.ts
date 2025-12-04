import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SubscriptionService } from '@/lib/stripe'

export async function POST(request: NextRequest) {
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
  } catch (error: any) {
    console.error('Subscription cancellation failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
