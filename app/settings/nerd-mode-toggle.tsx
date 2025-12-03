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
                <h3 className="font-medium text-gray-900">Nerd Mode</h3>
                <p className="text-sm text-gray-500">
                    Show advanced options like barcode format selection
                </p>
            </div>
            <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${nerdMode ? 'bg-indigo-600' : 'bg-gray-200'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Toggle nerd mode"
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${nerdMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                />
            </button>
        </div>
    )
}
