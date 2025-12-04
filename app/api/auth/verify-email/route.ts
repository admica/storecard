import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/resend'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // TEMPORARY: Accept any 6-digit code for testing
    // TODO: Replace with proper Supabase OTP verification
    if (!/^\d{6}$/.test(code)) {
=======
    // Verify the code using our Resend implementation
    const isValidCode = verifyCode(email, code)

    if (!isValidCode) {
>>>>>>> dbc3688 (Implement Resend email verification system)
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    // In production, verify with Supabase:
    // const { data, error } = await supabaseAdmin.auth.verifyOtp({
    //   email,
    //   token: code,
    //   type: 'email'
    // })
    //
    // if (error) {
    //   console.error('Error verifying code:', error)
    //   return NextResponse.json(
    //     { error: 'Invalid or expired verification code' },
    //     { status: 400 }
    //   )
    // }

    // Mark user as email verified in our database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
