"use client"

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react"

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  withLoading: <T>(promise: Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  // Start with loading true to prevent flash of content
  const [isLoading, setIsLoading] = useState(true)

  // Handle initial loading screen on app mount (works for all pages)
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // Check if we've already shown the initial loading screen in this session
    const hasShownInitialLoad = sessionStorage.getItem('luxenest-initial-load-shown')
    
    if (hasShownInitialLoad) {
      // Already shown, hide immediately
      setIsLoading(false)
      return
    }
    
    // Mark as shown for this session
    sessionStorage.setItem('luxenest-initial-load-shown', 'true')
    
    // Show loading screen on initial mount
    setIsLoading(true)

    // Hide after a minimum display time for smooth aesthetic experience
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000) // 5 seconds - long enough to be visually impactful, not too long to be annoying

    // Safety fallback - ensure loading is set to false after max time
    const safetyTimer = setTimeout(() => {
      setIsLoading(false)
    }, 5000) // Max 5 seconds, then force hide

    return () => {
      clearTimeout(timer)
      clearTimeout(safetyTimer)
    }
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      setIsLoading(true)
      try {
        const result = await promise
        return result
      } finally {
        // Delay for smooth transition and aesthetic appreciation
        setTimeout(() => setIsLoading(false), 500)
      }
    },
    []
  )

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

