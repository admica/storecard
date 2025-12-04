import FormData from 'form-data'
import Mailgun from 'mailgun.js'

// Temporary storage for verification codes (in production, use Redis/database)
const verificationCodes = new Map<string, { code: string; expiresAt: Date }>()

// Create Mailgun client (following official example pattern)
function getMailgunClient() {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY environment variable is not set')
  }
  
  const mailgun = new Mailgun(FormData)
  return mailgun.client({
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
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('[MAILGUN] API key or domain not configured')
    return false
  }

  const domain = process.env.MAILGUN_DOMAIN
  const fromEmail = `StoreCard <postmaster@${domain}>`

  try {
    // Create client on-demand (matching Mailgun example)
    const mg = getMailgunClient()
    
    console.log(`[MAILGUN] Sending email to ${email} using domain ${domain}`)

    // Match the exact format from Mailgun example
    const result = await mg.messages.create(domain, {
      from: fromEmail,
      to: [`${email}`], // Format as array of strings like Mailgun example
      subject: 'Verify Your StoreCard Account',
      text: `Welcome to StoreCard!

Thanks for signing up! To complete your registration, please use the verification code below:

${code}

This code will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

StoreCard - Organize your loyalty cards in one place`,
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

    // If we get here without an error, the email was sent successfully
    console.log('[MAILGUN] Email sent successfully:', result)
    return true
  } catch (error: any) {
    console.error('[MAILGUN] Email sending exception:', error)
    if (error instanceof Error) {
      console.error('[MAILGUN] Error message:', error.message)
      console.error('[MAILGUN] Error stack:', error.stack)
    }
    // Log the full error object if available
    if (error?.response) {
      console.error('[MAILGUN] Error response:', JSON.stringify(error.response, null, 2))
    }
    if (error?.body) {
      console.error('[MAILGUN] Error body:', JSON.stringify(error.body, null, 2))
    }
    if (error?.status) {
      console.error('[MAILGUN] Error status:', error.status)
    }
    if (error?.statusCode) {
      console.error('[MAILGUN] Error statusCode:', error.statusCode)
    }
    // Try to get the full error as JSON
    try {
      console.error('[MAILGUN] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    } catch (e) {
      console.error('[MAILGUN] Could not stringify error object')
    }
    return false
  }
}

