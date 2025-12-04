import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { SubscriptionService } from '@/lib/stripe'

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

    // Get the base URL for success/cancel URLs
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const checkoutSession = await SubscriptionService.createCheckoutSession(
      session.user.id,
      priceId,
      `${baseUrl}/dashboard?success=true`,
      `${baseUrl}/dashboard?canceled=true`
    )

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id
    })
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
