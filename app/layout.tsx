import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'StoreCard - Your Loyalty Cards',
    description: 'Organize and access your store loyalty cards instantly.',
    generator: 'Next.js',
    manifest: '/manifest.json',
    keywords: ['loyalty cards', 'wallet', 'store cards', 'digital wallet'],
    authors: [{ name: 'StoreCard Team' }],
    icons: [
        { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
        { rel: 'icon', url: '/icons/icon-192x192.png' },
    ],
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zooming on mobile for app-like feel
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-background text-primary antialiased`}>
                {children}
                <BottomNav />
            </body>
        </html>
    )
}
