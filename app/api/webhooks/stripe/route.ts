import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, SubscriptionService } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe environment variables not configured')
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 })
    }

    const body = await request.text()
    const headersList = await headers()

    const signature = headersList.get('stripe-signature')
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: any
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await SubscriptionService.syncSubscriptionFromStripe(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(invoice: any) {
  // Payment succeeded - ensure subscription is marked as active
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    await SubscriptionService.syncSubscriptionFromStripe(subscription)
  }
}

async function handlePaymentFailed(invoice: any) {
  // Payment failed - mark subscription as past due
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    // Check if customer is not deleted and has metadata
    if (!customer.deleted && customer.metadata?.userId) {
      const userId = customer.metadata.userId

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: SubscriptionStatus.PAST_DUE,
        },
      })
    }
  }
}
