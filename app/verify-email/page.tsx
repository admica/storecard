'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailForm() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params (set during registration)
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // If no email in URL, redirect to register
      router.push('/register')
    }
  }, [searchParams, router])

  useEffect(() => {
    // Countdown for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || code.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to subscription page after 2 seconds
        setTimeout(() => {
          router.push('/subscribe')
        }, 2000)
      } else {
        setError(data.error || 'Verification failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setError('')
    try {
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendCooldown(60) // 60 second cooldown
        setError('') // Clear any previous errors
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to resend code')
      }
    } catch {
      setError('Network error. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface dark:bg-surface p-8 card-shadow dark:card-shadow-dark border border-border-light dark:border-border text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">Email Verified!</h2>
            <p className="mt-2 text-muted">Redirecting you to subscription setup...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-8 rounded-2xl bg-surface dark:bg-surface p-8 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
            ✉️
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-muted">
            We&apos;ve sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-primary mb-1.5">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(value)
              }}
              className="block w-full rounded-xl border border-border dark:border-border bg-background dark:bg-surface-elevated px-4 py-3 text-primary placeholder-muted shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <p className="mt-1.5 text-xs text-muted text-center">
              Enter the 6-digit code from your email
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="flex w-full justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-light px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className="text-sm text-accent hover:text-accent-dark disabled:text-muted disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Didn&apos;t receive code? Resend'}
            </button>
          </div>

          <div className="flex items-center justify-center">
            <Link
              href="/register"
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              Wrong email? Go back
            </Link>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error/10 dark:bg-error/20 px-3 py-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-surface dark:bg-surface p-8 card-shadow dark:card-shadow-dark border border-border-light dark:border-border text-center">
          <div className="animate-pulse">
            <div className="mx-auto h-16 w-16 rounded-full bg-accent/20 mb-4"></div>
            <div className="h-8 bg-accent/20 rounded mb-2"></div>
            <div className="h-4 bg-accent/20 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
