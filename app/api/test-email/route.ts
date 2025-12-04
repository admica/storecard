import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail, generateVerificationCode } from '@/lib/mailgun'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate a test code
    const testCode = generateVerificationCode()
    console.log(`[TEST EMAIL] Attempting to send test email to ${email} with code ${testCode}`)

    // Try to send the email
    const emailSent = await sendVerificationEmail(email, testCode)

    if (emailSent) {
      console.log(`[TEST EMAIL] Email sent successfully to ${email}`)
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        code: testCode, // Include code in response for testing
      })
    } else {
      console.error(`[TEST EMAIL] Failed to send email to ${email}`)
      return NextResponse.json(
        {
          error: 'Failed to send email',
          message: 'Mailgun returned false. Check server logs for details.',
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[TEST EMAIL] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

