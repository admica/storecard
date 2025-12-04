import FormData from 'form-data'
import Mailgun from 'mailgun.js'

// Create Mailgun client (following official example pattern)
function getMailgunClient() {
  const apiKey = process.env.MAILGUN_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('MAILGUN_API_KEY environment variable is not set')
  }

  const mailgun = new Mailgun(FormData)
  return mailgun.client({
    username: 'api',
    key: apiKey,
  })
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification email
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  console.log('[MAILGUN] sendVerificationEmail called for:', email)
  console.log('[MAILGUN] MAILGUN_API_KEY exists:', !!process.env.MAILGUN_API_KEY)
  console.log('[MAILGUN] MAILGUN_DOMAIN exists:', !!process.env.MAILGUN_DOMAIN)
  console.log('[MAILGUN] MAILGUN_DOMAIN value:', process.env.MAILGUN_DOMAIN)

  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.error('[MAILGUN] API key or domain not configured')
    console.error('[MAILGUN] API key exists:', !!process.env.MAILGUN_API_KEY)
    console.error('[MAILGUN] Domain exists:', !!process.env.MAILGUN_DOMAIN)
    return false
  }

  const domain = process.env.MAILGUN_DOMAIN?.trim()
  if (!domain) {
    console.error('[MAILGUN] Domain not configured')
    return false
  }
  const fromEmail = `StoreCard <postmaster@${domain}>`

  try {
    // Create client on-demand (matching Mailgun example)
    let mg
    try {
      mg = getMailgunClient()
      console.log('[MAILGUN] Client created successfully')
    } catch (clientError) {
      console.error('[MAILGUN] Failed to create client:', clientError)
      return false
    }

    console.log(`[MAILGUN] Sending email to ${email} using domain ${domain}`)
    console.log(`[MAILGUN] From: ${fromEmail}`)

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

