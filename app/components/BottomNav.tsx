'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
    const pathname = usePathname()

    // Don't show on landing page or auth pages
    if (pathname === '/' || pathname === '/login' || pathname === '/register') {
        return null
    }

    const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/')

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
                <Link
                    href="/dashboard"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/dashboard') ? 'text-accent' : 'text-muted'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                <Link
                    href="/add"
                    className="flex flex-col items-center justify-center w-full h-full -mt-6"
                >
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95 ${isActive('/add') ? 'bg-accent text-white' : 'bg-primary text-white'
                        }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                </Link>

                <Link
                    href="/settings"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/settings') ? 'text-accent' : 'text-muted'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    )
}
