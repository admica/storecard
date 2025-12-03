'use client'

import { useState, useEffect, useRef } from 'react'
import { searchLogos } from '@/app/lib/actions'

interface LogoResult {
    source: 'cache' | 'api' | 'fallback'
    url: string
    name: string
}

interface LogoPickerProps {
    initialLogo?: string | null
    searchTerm: string
    onSelect: (logoUrl: string) => void
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

export default function LogoPicker({ initialLogo, searchTerm, onSelect, isOpen, onOpenChange }: LogoPickerProps) {
    const [query, setQuery] = useState(searchTerm)
    const [results, setResults] = useState<LogoResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [selectedLogo, setSelectedLogo] = useState<string | null>(initialLogo || null)
    const modalRef = useRef<HTMLDivElement>(null)

    // Update query when searchTerm changes, but only if modal is closed
    useEffect(() => {
        if (!isOpen && searchTerm) {
            setQuery(searchTerm)
        }
    }, [searchTerm, isOpen])

    // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onOpenChange(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onOpenChange])

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query) return

        setIsLoading(true)
        try {
            const logos = await searchLogos(query)
            setResults(logos)
        } catch (error) {
            console.error('Failed to search logos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Auto-search when opening modal if query exists
    useEffect(() => {
        if (isOpen && query) {
            handleSearch()
        }
    }, [isOpen])

    const handleSelect = (logoUrl: string) => {
        setSelectedLogo(logoUrl)
        onSelect(logoUrl)
        onOpenChange(false)
    }

    return (
        <div className="relative">
            <div className="flex items-center space-x-3">
                {selectedLogo ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border dark:border-border bg-surface dark:bg-surface-elevated p-1">
                        <img
                            src={selectedLogo}
                            alt="Selected logo"
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                // Fallback if image fails
                                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${query}.com&sz=128`
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedLogo(null)
                                onSelect('')
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 hover:opacity-100 transition-opacity rounded-full"
                            aria-label="Remove selected logo"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="h-12 w-12 shrink-0 rounded-full bg-accent/10 flex items-center justify-center text-muted">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => onOpenChange(true)}
                    className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                >
                    {selectedLogo ? 'Change Icon' : 'Select Icon'}
                </button>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
                    <div 
                        ref={modalRef} 
                        className="w-full max-w-md rounded-2xl bg-surface dark:bg-surface shadow-2xl overflow-hidden border border-border-light dark:border-border animate-slide-up"
                    >
                        <div className="border-b border-border-light dark:border-border p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-primary">Select Brand Icon</h3>
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="text-muted hover:text-primary transition-colors p-1"
                                aria-label="Close modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search brand name..."
                                    className="flex-1 rounded-xl border border-border dark:border-border bg-background dark:bg-surface-elevated px-4 py-2.5 text-sm text-primary placeholder-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl bg-gradient-to-r from-accent to-accent-light px-5 py-2.5 text-sm font-medium text-white hover:shadow-lg hover:shadow-accent/25 disabled:opacity-50 transition-all"
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                            </form>

                            <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                                {results.map((logo, index) => (
                                    <button
                                        key={`${logo.source}-${index}`}
                                        type="button"
                                        onClick={() => handleSelect(logo.url)}
                                        className="group relative aspect-square flex items-center justify-center rounded-xl border border-border-light dark:border-border bg-surface dark:bg-surface-elevated p-2 hover:border-accent hover:shadow-md transition-all"
                                    >
                                        <img
                                            src={logo.url}
                                            alt={logo.name}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                        {logo.source === 'cache' && (
                                            <span 
                                                className="absolute top-1 right-1 h-2 w-2 rounded-full bg-success" 
                                                title="From Cache"
                                                aria-label="Cached logo"
                                            />
                                        )}
                                    </button>
                                ))}
                                {results.length === 0 && !isLoading && (
                                    <div className="col-span-4 py-8 text-center text-sm text-muted">
                                        No icons found. Try a different search term.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
