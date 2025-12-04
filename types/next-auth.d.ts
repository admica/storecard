import { SubscriptionStatus, SubscriptionTier } from '@prisma/client'
import 'next-auth'

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

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
  }
}
