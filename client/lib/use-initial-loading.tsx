"use client"

import { useEffect } from "react"
import { useLoading } from "./loading-context"

export function useInitialLoading() {
  const { setLoading } = useLoading()

  useEffect(() => {
    // Show loading screen on initial mount
    setLoading(true)

    // Hide after a minimum display time for smooth aesthetic experience
    // Longer duration allows users to appreciate the visual design
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2800) // 2.8 seconds - long enough to be visually impactful, not too long to be annoying

    return () => clearTimeout(timer)
  }, [setLoading])
}

