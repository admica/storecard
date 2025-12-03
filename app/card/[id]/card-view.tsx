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

function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
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
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white animate-enter"
                onClick={toggleFullscreen}
            >
                <div className="w-full max-w-lg px-8 flex flex-col items-center space-y-12">
                    <div className="transform scale-150 origin-center">
                        {card.barcodeValue && card.barcodeFormat ? (
                            <Barcode value={card.barcodeValue} format={card.barcodeFormat} />
                        ) : (
                            <p className="text-muted">No barcode data</p>
                        )}
                    </div>

                    <div className="text-center">
                        <p className="text-4xl font-mono font-bold tracking-widest text-primary">
                            {card.barcodeValue}
                        </p>
                        <p className="mt-8 text-sm text-muted uppercase tracking-widest animate-pulse">
                            Tap to close
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex flex-1 flex-col items-center pt-24 px-6 pb-10">
            <div className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${getGradient(card.retailer)} p-8 shadow-2xl text-white mb-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-40 w-40 rounded-full bg-black/10 blur-3xl"></div>

                <div className="relative z-10 flex flex-col h-48 justify-between">
                    <div className="flex justify-between items-start">
                        <h1 className="text-3xl font-bold tracking-tight">{card.retailer}</h1>
                        <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold">
                            {card.retailer[0].toUpperCase()}
                        </div>
                    </div>

                    <div>
                        {card.note && (
                            <p className="text-white/80 font-medium mb-1">{card.note}</p>
                        )}
                        <p className="text-sm text-white/60 uppercase tracking-widest">Loyalty Card</p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-6">
                <div
                    className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer transition-transform active:scale-95"
                    onClick={toggleFullscreen}
                >
                    <div className="w-full flex justify-center py-4">
                        {card.barcodeValue && card.barcodeFormat ? (
                            <div className="w-full max-w-[280px]">
                                <Barcode value={card.barcodeValue} format={card.barcodeFormat} />
                            </div>
                        ) : (
                            <div className="text-muted italic">No barcode data</div>
                        )}
                    </div>
                    <p className="mt-4 text-xl font-mono font-bold tracking-widest text-primary">
                        {card.barcodeValue}
                    </p>
                    <p className="mt-2 text-xs text-accent font-medium uppercase tracking-wider">
                        Tap for Fullscreen
                    </p>
                </div>

                {card.image && (
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
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
