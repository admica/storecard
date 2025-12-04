import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // TEMPORARY: Generate and log verification code for testing
    // TODO: Replace with proper email service (Supabase SMTP, Resend, etc.)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code temporarily (in production, use Redis/database with expiry)
    // For now, just log it so user can see it
    console.log(`🔐 VERIFICATION CODE for ${email}: ${verificationCode}`)
    console.log(`📧 In production, this would be emailed to the user`)

    // Mock successful response
    // const { error } = await supabaseAdmin.auth.signInWithOtp({
    //   email,
    //   options: {
    //     shouldCreateUser: false,
    //   }
    // })

    // if (error) {
    //   console.error('Error sending verification code:', error)
    //   return NextResponse.json(
    //     { error: 'Failed to send verification code' },
    //     { status: 500 }
    //   )
    // }

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
