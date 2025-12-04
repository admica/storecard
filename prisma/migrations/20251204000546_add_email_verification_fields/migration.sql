-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "lastVerificationAttempt" TIMESTAMP(3),
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionSelected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationAttempts" INTEGER NOT NULL DEFAULT 0;
