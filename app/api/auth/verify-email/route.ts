import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/mailgun'
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

    // Verify the code using our Mailgun implementation
    const isValidCode = verifyCode(email, code)

    if (!isValidCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark user as email verified in our database
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
