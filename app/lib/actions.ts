'use server'

import { signIn, signOut, auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { put } from '@vercel/blob'
import { SubscriptionTier } from '@prisma/client'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/mailgun'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}

export async function register(prevState: string | undefined, formData: FormData) {
    try {
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        const parsed = z.object({
            email: z.string().email(),
            password: z.string().min(6),
        }).safeParse({ email, password })

        if (!parsed.success) {
            return 'Invalid fields'
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return 'User already exists.'
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user first
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })

        // Create default FREE subscription for new user
        await prisma.subscription.create({
            data: {
                userId: user.id,
                tier: SubscriptionTier.FREE,
            },
        })

        // Send verification code using Mailgun
        try {
            // Generate verification code
            const verificationCode = generateVerificationCode()
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

            // Store code in database
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verificationCode,
                    verificationCodeExpiresAt: expiresAt
                }
            })

            // Send email with verification code (await to ensure it completes in serverless)
            await sendVerificationEmail(email, verificationCode)
            console.log(`[REGISTRATION] Verification email sent to ${email}`)
        } catch (emailError) {
            console.error('[REGISTRATION] Email setup/sending error (non-blocking):', emailError)
            // Continue with registration even if email fails
        }

        // Always return success - UI will handle redirect to verification page
        // Email sending happens asynchronously and won't block the redirect
        return 'success'

    } catch (error) {
        console.error('Registration error:', error)
        return 'Failed to create account. Please try again.'
    }
}

export async function createCard(prevState: string | undefined, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        return 'Not authenticated'
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
    })

    if (!user) {
        return 'User not found'
    }

    const retailer = formData.get('retailer') as string
    const note = formData.get('note') as string
    const barcodeValue = formData.get('barcodeValue') as string
    const barcodeFormat = formData.get('barcodeFormat') as string
    const imageFile = formData.get('image') as File
    const logo = formData.get('logo') as string
    const colorLight = formData.get('colorLight') as string
    const colorDark = formData.get('colorDark') as string

    if (!retailer) {
        return 'Retailer name is required'
    }

    let imagePath = null
    if (imageFile && imageFile.size > 0) {
        try {
            const blob = await put(imageFile.name, imageFile, {
                access: 'public',
            })
            imagePath = blob.url
        } catch (error) {
            console.error('Image upload failed:', error)
            // Continue without image rather than failing completely
        }
    }

    await prisma.card.create({
        data: {
            retailer,
            barcodeValue,
            barcodeFormat,
            note,
            image: imagePath,
            logo: logo || null,
            colorLight: colorLight || null,
            colorDark: colorDark || null,
            userId: user.id,
        },
    })

    // Cache logo and colors if provided
    if (logo) {
        const normalizedName = retailer.toLowerCase().trim()
            .replace(/\s+(store|inc|llc|ltd|corp|corporation)$/g, '')
            .trim()

        try {
            await prisma.brandLogo.upsert({
                where: { name: normalizedName },
                update: {
                    logoUrl: logo,
                    ...(colorLight ? { colorLight } : {}),
                    ...(colorDark ? { colorDark } : {}),
                },
                create: {
                    name: normalizedName,
                    logoUrl: logo,
                    colorLight: colorLight || null,
                    colorDark: colorDark || null,
                }
            })
        } catch (e) {
            console.error('Failed to cache logo:', e)
        }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function deleteCard(id: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const card = await prisma.card.findUnique({
        where: { id },
        include: { user: true }
    })

    if (card && card.user.email === session.user.email) {
        await prisma.card.delete({ where: { id } })
        revalidatePath('/dashboard')
        redirect('/dashboard')
    }
}

export async function updateCard(id: string, prevState: string | undefined, formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        return 'Not authenticated'
    }

    const retailer = formData.get('retailer') as string
    const note = formData.get('note') as string
    const barcodeValue = formData.get('barcodeValue') as string
    const barcodeFormat = formData.get('barcodeFormat') as string
    const imageFile = formData.get('image') as File
    const logo = formData.get('logo') as string
    const colorLight = formData.get('colorLight') as string
    const colorDark = formData.get('colorDark') as string

    if (!retailer) {
        return 'Retailer name is required'
    }

    const existingCard = await prisma.card.findUnique({
        where: { id },
        include: { user: true }
    })

    if (!existingCard || existingCard.user.email !== session.user.email) {
        return 'Card not found or unauthorized'
    }

    let imagePath = existingCard.image
    if (imageFile && imageFile.size > 0) {
        try {
            const blob = await put(imageFile.name, imageFile, {
                access: 'public',
            })
            imagePath = blob.url
        } catch (error) {
            console.error('Image upload failed:', error)
            // Keep existing image if new upload fails
        }
    }

    await prisma.card.update({
        where: { id },
        data: {
            retailer,
            note,
            barcodeValue,
            barcodeFormat,
            image: imagePath,
            ...(logo ? { logo } : {}),
            ...(colorLight ? { colorLight } : {}),
            ...(colorDark ? { colorDark } : {}),
        },
    })

    // Cache logo and colors if provided
    if (logo) {
        const normalizedName = retailer.toLowerCase().trim()
            .replace(/\s+(store|inc|llc|ltd|corp|corporation)$/g, '')
            .trim()

        try {
            await prisma.brandLogo.upsert({
                where: { name: normalizedName },
                update: {
                    logoUrl: logo,
                    ...(colorLight ? { colorLight } : {}),
                    ...(colorDark ? { colorDark } : {}),
                },
                create: {
                    name: normalizedName,
                    logoUrl: logo,
                    colorLight: colorLight || null,
                    colorDark: colorDark || null,
                }
            })
        } catch (e) {
            console.error('Failed to cache logo:', e)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath(`/card/${id}`)
    redirect(`/card/${id}`)
}

export async function updateLastUsed(cardId: string) {
    const session = await auth()
    if (!session?.user?.email) return

    const card = await prisma.card.findUnique({
        where: { id: cardId },
        include: { user: true }
    })

    if (card && card.user.email === session.user.email) {
        await prisma.card.update({
            where: { id: cardId },
            data: { lastUsed: new Date() }
        })
        revalidatePath('/dashboard')
    }
}

export async function updateNerdMode(enabled: boolean) {
    const session = await auth()
    if (!session?.user?.email) return

    await prisma.user.update({
        where: { email: session.user.email },
        data: { nerdMode: enabled }
    })

    revalidatePath('/settings')
    revalidatePath('/add')
    revalidatePath('/card/[id]/edit')
}

export async function updateDarkMode(enabled: boolean) {
    const session = await auth()
    if (!session?.user?.email) return

    await prisma.user.update({
        where: { email: session.user.email },
        data: { darkMode: enabled }
    })

    revalidatePath('/settings')
    revalidatePath('/')
}

export async function searchLogos(query: string) {
    if (!query || query.length < 2) return []

    // Normalize query
    const normalizedQuery = query.toLowerCase().trim()
        .replace(/\s+(store|inc|llc|ltd|corp|corporation)$/g, '')
        .trim()

    // 1. Check cache first
    const cachedLogo = await prisma.brandLogo.findUnique({
        where: { name: normalizedQuery }
    })

    const results: {
        source: 'cache' | 'api' | 'fallback';
        url: string;
        name: string;
        colorLight?: string | null;
        colorDark?: string | null;
    }[] = []

    if (cachedLogo) {
        results.push({
            source: 'cache',
            url: cachedLogo.logoUrl,
            name: query, // Use original query as display name
            colorLight: cachedLogo.colorLight,
            colorDark: cachedLogo.colorDark,
        })
    }

    // 2. Always add Google Favicon fallback
    // Try to guess domain by removing spaces
    const domainGuess = normalizedQuery.replace(/\s+/g, '')
    results.push({
        source: 'fallback',
        url: `https://www.google.com/s2/favicons?domain=${domainGuess}.com&sz=128`,
        name: `${query} (Favicon)`
    })

    // 3. Call Clearbit Autocomplete API (Free)
    try {
        const response = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(normalizedQuery)}`)
        if (response.ok) {
            const data = await response.json()
            // data is array of { name: string, domain: string, logo: string }
            data.forEach((item: any) => {
                // Avoid duplicates
                const isDuplicate = results.some(r => r.url === item.logo)
                if (!isDuplicate && cachedLogo?.logoUrl !== item.logo) {
                    results.push({
                        source: 'api',
                        url: item.logo,
                        name: item.name
                    })
                }
            })
        }
    } catch (error) {
        console.error('Clearbit search failed:', error)
    }

    // 4. Call logo.dev API if not in cache (or even if in cache, to offer more options)
    // Only if we have keys
    if (process.env.LOGO_DEV_SECRET) {
        try {
            const response = await fetch(`https://api.logo.dev/search?q=${encodeURIComponent(normalizedQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.LOGO_DEV_SECRET}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                // data is array of { name: string, domain: string, logo_url: string }
                data.slice(0, 5).forEach((item: any) => {
                    // Avoid duplicates
                    const isDuplicate = results.some(r => r.url === item.logo_url)
                    if (!isDuplicate && cachedLogo?.logoUrl !== item.logo_url) {
                        results.push({
                            source: 'api',
                            url: item.logo_url,
                            name: item.name || item.domain
                        })
                    }
                })
            }
        } catch (error) {
            console.error('Logo.dev search failed:', error)
        }
    }

    return results
}

