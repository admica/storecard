import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SubscriptionService } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(session.user.id)

    return NextResponse.json(subscriptionStatus)
  } catch (error: any) {
    console.error('Failed to get subscription status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}
