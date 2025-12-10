'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import Barcode from '@/app/components/Barcode'
import { updateLastUsed } from '@/app/lib/actions'

interface CardViewProps {
    card: {
        id: string
        retailer: string
        barcodeValue: string | null
        barcodeFormat: string | null
        image: string | null
        logo: string | null
        note: string | null
        colorLight: string | null
        colorDark: string | null
    }
    isDarkMode?: boolean
}

function getGradient(name: string) {
    const gradients = [
        'from-blue-500 to-cyan-400',
        'from-purple-500 to-pink-400',
        'from-emerald-500 to-teal-400',
        'from-orange-500 to-amber-400',
        'from-rose-500 to-red-400',
        'from-indigo-500 to-violet-400',
    ]
    const index = name.length % gradients.length
    return gradients[index]
}

export default function CardView({ card, isDarkMode = false }: CardViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        // Track card usage when component mounts
        updateLastUsed(card.id)
    }, [card.id])

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    // Determine if we have custom colors
    const hasCustomColors = card.colorLight && card.colorDark
    const backgroundColor = hasCustomColors 
        ? (isDarkMode ? card.colorDark : card.colorLight)
        : null

    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white animate-fade-in px-6"
                onClick={toggleFullscreen}
            >
                <div className="w-full max-w-lg px-4 sm:px-8 flex flex-col items-center space-y-12">
                    <div className="w-full flex justify-center overflow-hidden">
                        {card.barcodeValue && card.barcodeFormat ? (
                            <div className="transform scale-125 sm:scale-150 origin-center">
                                <Barcode value={card.barcodeValue} format={card.barcodeFormat} />
                            </div>
                        ) : (
                            <p className="text-gray-400">No barcode data</p>
                        )}
                    </div>

                    <div className="text-center px-4">
                        <p className="text-2xl sm:text-4xl font-mono font-bold tracking-widest text-gray-900 break-all">
                            {card.barcodeValue}
                        </p>
                        <p className="mt-8 text-sm text-gray-400 uppercase tracking-widest animate-pulse">
                            Tap to close
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col items-center pt-24 px-6 pb-10">
            <div 
                className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl text-white mb-8 relative overflow-hidden ${
                    hasCustomColors ? '' : `bg-gradient-to-br ${getGradient(card.retailer)}`
                }`}
                style={hasCustomColors ? { backgroundColor: backgroundColor! } : undefined}
            >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 rounded-full bg-black/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col h-48 justify-between">
                    <div className="flex justify-between items-start">
                        <h1 className={`text-3xl font-bold tracking-tight ${
                            hasCustomColors && !isDarkMode ? 'text-gray-800' : 'text-white'
                        }`}>{card.retailer}</h1>
                        {card.logo ? (
                            <div className="h-24 w-24 rounded-2xl bg-white p-2 flex items-center justify-center overflow-hidden shadow-lg">
                                <img src={card.logo} alt={card.retailer} className="h-full w-full object-contain" />
                            </div>
                        ) : (
                            <div className={`h-24 w-24 rounded-2xl backdrop-blur-md flex items-center justify-center text-4xl font-bold ${
                                hasCustomColors && !isDarkMode 
                                    ? 'bg-gray-800/10 text-gray-800' 
                                    : 'bg-white/20 text-white'
                            }`}>
                                {card.retailer[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div>
                        {card.note && (
                            <p className={`font-medium mb-1 ${
                                hasCustomColors && !isDarkMode ? 'text-gray-700' : 'text-white/80'
                            }`}>{card.note}</p>
                        )}
                        <p className={`text-sm uppercase tracking-widest ${
                            hasCustomColors && !isDarkMode ? 'text-gray-500' : 'text-white/60'
                        }`}>Loyalty Card</p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-6">
                {/* Barcode container - always white for scanability */}
                <div
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-200 flex flex-col items-center cursor-pointer transition-transform active:scale-95 hover:shadow-md"
                    onClick={toggleFullscreen}
                    role="button"
                    aria-label="View barcode fullscreen"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleFullscreen()}
                >
                    <div className="w-full flex justify-center py-4">
                        {card.barcodeValue && card.barcodeFormat ? (
                            <div className="w-full max-w-[280px]">
                                <Barcode value={card.barcodeValue} format={card.barcodeFormat} />
                            </div>
                        ) : (
                            <div className="text-gray-400 italic">No barcode data</div>
                        )}
                    </div>
                    <p className="mt-4 text-xl font-mono font-bold tracking-widest text-gray-900">
                        {card.barcodeValue}
                    </p>
                    <p className="mt-2 text-xs text-accent font-medium uppercase tracking-wider">
                        Tap for Fullscreen
                    </p>
                </div>

                {card.image && (
                    <div className="bg-surface dark:bg-surface rounded-2xl p-4 card-shadow dark:card-shadow-dark border border-border-light dark:border-border">
                        <img src={card.image} alt="Card Image" className="w-full rounded-xl object-contain" />
                    </div>
                )}

                <div className="text-center">
                    <p className="text-xs text-muted">
                        Brightness automatically increased in fullscreen
                    </p>
                </div>
            </div>
        </main>
    )
}
