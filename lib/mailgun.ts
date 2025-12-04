import FormData from 'form-data'
import Mailgun from 'mailgun.js'

// Temporary storage for verification codes (in production, use Redis/database)
const verificationCodes = new Map<string, { code: string; expiresAt: Date }>()

// Initialize Mailgun client
let mailgunClient: any = null

if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
  const mailgun = new Mailgun(FormData)
  mailgunClient = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  })
}

export { verificationCodes }

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
  if (!mailgunClient) {
    console.error('Mailgun API key or domain not configured')
    return false
  }

  const domain = process.env.MAILGUN_DOMAIN!
  const fromEmail = `StoreCard <postmaster@${domain}>`

  try {
    const data = await mailgunClient.messages.create(domain, {
      from: fromEmail,
      to: [email],
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

    console.log('Verification email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Email sending exception:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return false
  }
}

