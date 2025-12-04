import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Temporary storage for verification codes (in production, use Redis/database)
const verificationCodes = new Map<string, { code: string; expiresAt: Date }>()

export { resend, verificationCodes }

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Store verification code with expiry (24 hours)
export function storeVerificationCode(email: string, code: string): void {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  verificationCodes.set(email, { code, expiresAt })
}

// Verify a code
export function verifyCode(email: string, code: string): boolean {
  const stored = verificationCodes.get(email)
  if (!stored) return false

  // Check if expired
  if (stored.expiresAt < new Date()) {
    verificationCodes.delete(email)
    return false
  }

  // Check if code matches
  if (stored.code !== code) return false

  // Code is valid, remove it (one-time use)
  verificationCodes.delete(email)
  return true
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  if (!resend) {
    console.error('Resend API key not configured')
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: 'StoreCard <onboarding@storecard.email>',
      to: email,
      subject: 'Verify Your StoreCard Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Welcome to StoreCard!</h1>

          <p style="font-size: 16px; line-height: 1.6; color: #666;">
            Thanks for signing up! To complete your registration, please use the verification code below:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px;">
              <span style="font-size: 32px; font-weight: bold; color: #007bff; font-family: monospace;">
                ${code}
              </span>
            </div>
          </div>

          <p style="font-size: 14px; color: #999; text-align: center;">
            This code will expire in 24 hours.
          </p>

          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
            If you didn't create an account, you can safely ignore this email.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="font-size: 12px; color: #999; text-align: center;">
            StoreCard - Organize your loyalty cards in one place
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}
