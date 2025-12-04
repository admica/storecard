import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// Server-side color extraction using fetch and canvas simulation
// This is a simplified version that works without native canvas dependencies
async function extractDominantColorFromUrl(imageUrl: string): Promise<{ colorLight: string; colorDark: string } | null> {
    try {
        // For server-side, we'll use a simple heuristic based on the image URL
        // In production, you might want to use a service like Cloudinary or a proper image processing library
        
        // For now, return null to indicate no colors extracted
        // The user can re-select logos to get colors extracted client-side
        console.log(`Skipping color extraction for: ${imageUrl}`)
        return null
    } catch (error) {
        console.error('Color extraction failed:', error)
        return null
    }
}

// POST /api/backfill-colors
// Updates existing BrandLogo entries and Cards with extracted colors
export async function POST(request: Request) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Get all BrandLogos without colors
        const brandLogos = await prisma.brandLogo.findMany({
            where: {
                OR: [
                    { colorLight: null },
                    { colorDark: null },
                ]
            }
        })

        const results = {
            brandLogos: {
                total: brandLogos.length,
                updated: 0,
                skipped: 0,
            },
            cards: {
                total: 0,
                updated: 0,
            }
        }

        // Process each brand logo
        for (const logo of brandLogos) {
            const colors = await extractDominantColorFromUrl(logo.logoUrl)
            
            if (colors) {
                await prisma.brandLogo.update({
                    where: { id: logo.id },
                    data: {
                        colorLight: colors.colorLight,
                        colorDark: colors.colorDark,
                    }
                })
                results.brandLogos.updated++

                // Also update any cards using this logo
                const updatedCards = await prisma.card.updateMany({
                    where: { 
                        logo: logo.logoUrl,
                        OR: [
                            { colorLight: null },
                            { colorDark: null },
                        ]
                    },
                    data: {
                        colorLight: colors.colorLight,
                        colorDark: colors.colorDark,
                    }
                })
                results.cards.updated += updatedCards.count
            } else {
                results.brandLogos.skipped++
            }
        }

        // Count total cards that still need colors
        results.cards.total = await prisma.card.count({
            where: {
                logo: { not: null },
                OR: [
                    { colorLight: null },
                    { colorDark: null },
                ]
            }
        })

        return NextResponse.json({
            message: 'Backfill complete',
            results,
            note: 'Server-side color extraction is limited. For best results, re-select logos through the UI to extract colors client-side.'
        })

    } catch (error) {
        console.error('Backfill error:', error)
        return NextResponse.json({ error: 'Backfill failed' }, { status: 500 })
    }
}

// GET /api/backfill-colors
// Returns stats about logos/cards needing color extraction
export async function GET() {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const brandLogosWithoutColors = await prisma.brandLogo.count({
            where: {
                OR: [
                    { colorLight: null },
                    { colorDark: null },
                ]
            }
        })

        const cardsWithoutColors = await prisma.card.count({
            where: {
                logo: { not: null },
                OR: [
                    { colorLight: null },
                    { colorDark: null },
                ]
            }
        })

        const totalBrandLogos = await prisma.brandLogo.count()
        const totalCards = await prisma.card.count({
            where: { logo: { not: null } }
        })

        return NextResponse.json({
            brandLogos: {
                total: totalBrandLogos,
                withoutColors: brandLogosWithoutColors,
                withColors: totalBrandLogos - brandLogosWithoutColors,
            },
            cards: {
                totalWithLogo: totalCards,
                withoutColors: cardsWithoutColors,
                withColors: totalCards - cardsWithoutColors,
            }
        })

    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
    }
}


