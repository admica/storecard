'use client'

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
        note: string | null
    }
}

export default function CardView({ card }: CardViewProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        // Track card usage when component mounts
        updateLastUsed(card.id)
    }, [card.id])

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black"
                onClick={toggleFullscreen}
            >
                <div className="w-full max-w-lg px-4">
                    {card.barcodeValue && card.barcodeFormat ? (
                        <div className="flex flex-col items-center">
                            <Barcode value={card.barcodeValue} format={card.barcodeFormat} />
                            <p className="mt-6 text-3xl font-mono font-bold tracking-wider text-white">
                                {card.barcodeValue}
                            </p>
                            <p className="mt-4 text-sm text-gray-400">Tap to exit fullscreen</p>
                        </div>
                    ) : (
                        <div className="text-center text-white">
                            <p className="text-lg">No barcode data</p>
                            <p className="mt-2 text-sm text-gray-400">Tap to exit</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5">
                    {card.barcodeValue && card.barcodeFormat ? (
                        <div
                            className="cursor-pointer transition-transform hover:scale-105"
                            onClick={toggleFullscreen}
                        >
                            <div className="flex justify-center py-8">
                                <div className="w-[70%]">
                                    <Barcode value={card.barcodeValue} format={card.barcodeFormat} />
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-indigo-600 font-medium">
                                Tap for fullscreen
                            </p>
                        </div>
                    ) : (
                        <div className="py-8 text-gray-400 italic">No barcode data</div>
                    )}

                    {card.image && (
                        <div className="mt-4">
                            <img src={card.image} alt="Card Image" className="mx-auto max-h-64 rounded-lg object-contain" />
                        </div>
                    )}

                    <div className="mt-6">
                        <p className="text-2xl font-mono font-bold tracking-wider text-gray-900">
                            {card.barcodeValue}
                        </p>
                        {card.note && <p className="mt-2 text-sm text-gray-500">{card.note}</p>}
                    </div>
                </div>

                <p className="text-xs text-gray-400">
                    Tip: Turn up your screen brightness for easier scanning.
                </p>
            </div>
        </main>
    )
}
