import { NextRequest, NextResponse } from 'next/server'
import { generateVerificationCode, storeVerificationCode, sendVerificationEmail } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Store code temporarily with expiry
    storeVerificationCode(email, verificationCode)

    // Send email with verification code
    const emailSent = await sendVerificationEmail(email, verificationCode)

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email'
    })
  } catch (error) {
    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
