import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SubscriptionService } from '@/lib/stripe'
import { SubscriptionTier } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const priceId = plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID!
      : process.env.STRIPE_YEARLY_PRICE_ID!

    const tier = plan === 'monthly' ? SubscriptionTier.MONTHLY : SubscriptionTier.YEARLY

    await SubscriptionService.updateSubscription(session.user.id, priceId, tier)

    return NextResponse.json({
      success: true,
      message: `Subscription updated to ${plan} plan`
    })
  } catch (error: any) {
    console.error('Subscription update failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
