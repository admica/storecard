'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
    children,
    initialTheme = 'light',
}: {
    children: React.ReactNode
    initialTheme?: Theme
}) {
    const [theme, setThemeState] = useState<Theme>(initialTheme)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Remove no-transitions class after mount to enable smooth transitions
        document.documentElement.classList.remove('no-transitions')
    }, [])

    useEffect(() => {
        if (mounted) {
            const root = document.documentElement
            if (theme === 'dark') {
                root.classList.add('dark')
            } else {
                root.classList.remove('dark')
            }
        }
    }, [theme, mounted])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
    }

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
    }

    // Prevent flash by not rendering until mounted
    if (!mounted) {
        return (
            <ThemeContext.Provider value={{ theme: initialTheme, setTheme, toggleTheme }}>
                {children}
            </ThemeContext.Provider>
        )
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}


