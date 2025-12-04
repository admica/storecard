# StoreCard Subscription System Documentation

## Overview

StoreCard is a loyalty card management application that includes a complete subscription system built with Next.js, Prisma, Supabase, and Stripe. The system provides tiered subscriptions (FREE, MONTHLY, YEARLY) with automatic billing, webhooks, and session-based access control.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Supabase PostgreSQL
- **Authentication**: NextAuth.js v5
- **Payments**: Stripe API + Webhooks
- **Deployment**: Vercel

### Database Schema

```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  password      String
  nerdMode      Boolean       @default(false)
  darkMode      Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  cards         Card[]
  subscription  Subscription?
}

model Subscription {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  tier                SubscriptionTier   @default(FREE)
  status              SubscriptionStatus @default(INACTIVE)
  stripeCustomerId    String?
  stripeSubscriptionId String?
  currentPeriodEnd    DateTime?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
}

model Card {
  id            String   @id @default(cuid())
  retailer      String
  note          String?
  barcodeValue  String?
  barcodeFormat String?
  image         String?
  logo          String?
  colorLight    String?
  colorDark     String?
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  lastUsed      DateTime?
}

model BrandLogo {
  id         String   @id @default(cuid())
  name       String   @unique
  logoUrl    String
  colorLight String?
  colorDark  String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

enum SubscriptionTier {
  FREE
  MONTHLY
  YEARLY
}

enum SubscriptionStatus {
  INACTIVE
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  INCOMPLETE
  INCOMPLETE_EXPIRED
  TRIALING
}
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handlers

### Subscription Management

#### Create Checkout Session
```http
POST /api/create-checkout-session
Content-Type: application/json

{
  "plan": "monthly" | "yearly"
}
```
**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```
Creates a Stripe checkout session for subscription purchase.

#### Get Subscription Status
```http
GET /api/subscription/status
```
**Response:**
```json
{
  "subscriptionId": "sub_xxx",
  "status": "ACTIVE",
  "tier": "MONTHLY",
  "currentPeriodEnd": "2024-12-31T23:59:59.000Z",
  "isActive": true,
  "isFree": false
}
```

#### Cancel Subscription
```http
POST /api/subscription/cancel
```
**Response:**
```json
{
  "success": true,
  "message": "Subscription will be canceled at the end of the current period"
}
```

#### Update Subscription
```http
POST /api/subscription/update
Content-Type: application/json

{
  "plan": "monthly" | "yearly"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Subscription updated to monthly plan"
}
```

#### Stripe Webhooks
```http
POST /api/webhooks/stripe
X-Stripe-Signature: webhook_signature
Content-Type: application/json
```
Automatically handles Stripe webhook events to sync subscription status.

### Other Endpoints
- `POST /api/backfill-colors` - Background color processing for cards
- Additional endpoints for card management (inherited from base app)

## Frontend Integration

### Session Data Structure

```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()

// Subscription data is automatically included in session
if (session?.user?.subscription) {
  const {
    tier,        // 'FREE' | 'MONTHLY' | 'YEARLY'
    status,      // SubscriptionStatus enum
    currentPeriodEnd, // Date | null
    isActive,    // boolean
    isFree       // boolean
  } = session.user.subscription
}
```

### TypeScript Types

```typescript
// types/next-auth.d.ts
declare module 'next-auth' {
  interface User {
    id: string
    subscription?: {
      tier: SubscriptionTier
      status: SubscriptionStatus
      currentPeriodEnd: Date | null
      isActive: boolean
      isFree: boolean
    }
  }
}
```

### Usage Examples

#### Conditional Rendering Based on Subscription
```tsx
import { useSession } from 'next-auth/react'

export default function PremiumFeature() {
  const { data: session } = useSession()

  if (!session?.user?.subscription?.isActive) {
    return (
      <div className="upgrade-prompt">
        <p>Upgrade to access this feature!</p>
        <SubscribeButton plan="monthly" />
      </div>
    )
  }

  return <div>Premium content here</div>
}
```

#### Subscription Management Component
```tsx
import { useSession } from 'next-auth/react'

export default function SubscriptionManager() {
  const { data: session } = useSession()
  const subscription = session?.user?.subscription

  if (!subscription) return null

  return (
    <div className="subscription-status">
      <h3>Current Plan: {subscription.tier}</h3>
      <p>Status: {subscription.status}</p>

      {subscription.isActive && (
        <div>
          <p>Next billing: {subscription.currentPeriodEnd?.toLocaleDateString()}</p>
          <button onClick={() => cancelSubscription()}>
            Cancel Subscription
          </button>
        </div>
      )}

      {subscription.tier === 'FREE' && (
        <SubscribeButton plan="monthly" />
      )}
    </div>
  )
}
```

#### Subscribe Button Implementation
```tsx
'use client'

import { useState } from 'react'

export default function SubscribeButton({ plan }: { plan: 'monthly' | 'yearly' }) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })

      const { url } = await response.json()
      window.location.href = url // Redirect to Stripe Checkout
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSubscribe} disabled={loading}>
      {loading ? 'Loading...' : `Subscribe ${plan}`}
    </button>
  )
}
```

## Authentication Flow

### User Registration
1. User registers via `/register`
2. **Automatic FREE subscription creation** in database
3. NextAuth session includes subscription data

### Session Management
- JWT tokens include user ID
- Session callbacks fetch fresh subscription data
- Subscription status available throughout app

## Stripe Configuration

### Products Setup
- **Monthly Plan**: $4/month - Price ID: `price_1SaTwxBXO63QKJDqNXKs6ljB`
- **Yearly Plan**: $40/year - Price ID: `price_1SaU8JBXO63QKJDqQ5PhP5EW`

### Webhook Events
The system listens for these Stripe webhook events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Environment Variables
```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID=price_1SaTwxBXO63QKJDqNXKs6ljB
STRIPE_YEARLY_PRICE_ID=price_1SaU8JBXO63QKJDqQ5PhP5EW

# Database (Supabase)
DATABASE_URL=postgres://...
DIRECT_URL=postgres://...

# NextAuth
AUTH_SECRET=your-secret

# Other app configs...
```

## Testing

### Backend Testing
```bash
# Test user registration (creates FREE subscription)
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'

# Test subscription status
curl http://localhost:3000/api/subscription/status \
  -H 'Cookie: next-auth.session-token=YOUR_TOKEN'
```

### Stripe Testing
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Webhook Testing
```bash
# Use Stripe CLI to forward webhooks locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Deployment

### Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npx prisma migrate deploy && npx prisma generate && next build",
  "installCommand": "npm install"
}
```

### Environment Setup
1. Set all environment variables in Vercel dashboard
2. Configure Stripe webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Enable webhook events listed above

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Set up database
# (Handled by Supabase - environment variables in .env)

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name migration-name

# Deploy to production
npx prisma migrate deploy
```

### Testing Subscription Flows
1. Register new user → Gets FREE subscription
2. Subscribe to plan → Redirects to Stripe Checkout
3. Complete payment → Webhook updates subscription to ACTIVE
4. Check session data → Should reflect new subscription status

## Future Enhancements

### Potential Features
- **Usage Limits**: FREE tier limits (max 10 cards, etc.)
- **Team Subscriptions**: Multi-user accounts
- **Custom Plans**: Flexible pricing tiers
- **Billing History**: Payment history and invoices
- **Dunning Management**: Failed payment recovery
- **Subscription Analytics**: Usage metrics and insights

### Technical Improvements
- **Redis Caching**: Session and subscription data caching
- **Webhook Retry Logic**: Handle failed webhook processing
- **Subscription Metrics**: Analytics and reporting
- **Multi-currency Support**: International pricing
- **Subscription Pausing**: Temporary subscription suspension

## Troubleshooting

### Common Issues

#### Session Data Not Updating
- Check NextAuth session callbacks in `auth.config.ts`
- Verify database connection and subscription table data
- Clear NextAuth session and re-login

#### Webhook Events Not Processing
- Verify webhook endpoint URL in Stripe dashboard
- Check webhook signature validation
- Ensure all required events are enabled

#### Database Migration Errors
- Check database connection string
- Verify Supabase credentials
- Run `npx prisma db push` for schema sync

#### Stripe Checkout Errors
- Verify price IDs match Stripe dashboard
- Check environment variables are set correctly
- Test with Stripe test mode cards

## Support

For issues related to:
- **Stripe Integration**: Check Stripe dashboard and webhook logs
- **Database Issues**: Verify Supabase connection and table schemas
- **Authentication**: Review NextAuth configuration and session handling
- **Deployment**: Check Vercel build logs and environment variables

## Contributing

When extending the subscription system:
1. Update database schema with proper migrations
2. Add TypeScript types for new features
3. Update API documentation
4. Test webhook handling for new events
5. Ensure session data includes new subscription fields
