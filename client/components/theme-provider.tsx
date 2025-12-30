"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useMedia } from "react-use"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "dark" | "light"
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  resolvedTheme: "light",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "luxenest-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const prefersDark = useMedia("(prefers-color-scheme: dark)", false)
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const resolvedTheme = theme === "system" ? (prefersDark ? "dark" : "light") : theme
    setResolvedTheme(resolvedTheme)

    if (mounted) {
      document.documentElement.classList.toggle("dark", resolvedTheme === "dark")
      localStorage.setItem(storageKey, theme)
    }
  }, [theme, prefersDark, mounted, storageKey])

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
