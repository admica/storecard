'use client'

import { updateNerdMode } from '@/app/lib/actions'
import { useState, useTransition } from 'react'

export default function NerdModeToggle({ initialValue }: { initialValue: boolean }) {
    const [nerdMode, setNerdMode] = useState(initialValue)
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        const newValue = !nerdMode
        setNerdMode(newValue)
        startTransition(async () => {
            await updateNerdMode(newValue)
        })
    }

    return (
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-accent">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-primary">Nerd Mode</h3>
                        <p className="text-sm text-muted">
                            Show barcode format options
                        </p>
                    </div>
                </div>
            </div>
            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    nerdMode ? 'bg-accent' : 'bg-border'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="switch"
                aria-checked={nerdMode}
                aria-label="Toggle nerd mode"
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                        nerdMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    )
}
