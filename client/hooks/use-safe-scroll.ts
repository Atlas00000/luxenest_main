"use client"

import { useRef, useEffect, useState } from "react"
import { useScroll, useMotionValue, MotionValue } from "framer-motion"

interface UseSafeScrollOptions {
  offset?: [string, string]
  layoutEffect?: boolean
}

/**
 * Safe wrapper for useScroll that handles hydration issues
 * Ensures the ref is available before using scroll tracking
 */
export function useSafeScroll(options: UseSafeScrollOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const fallbackProgress = useMotionValue(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Only use scroll tracking if mounted and ref is available
  const shouldTrack = isMounted && containerRef.current !== null

  const { scrollYProgress } = useScroll(
    shouldTrack
      ? {
          target: containerRef,
          offset: options.offset || ["start end", "end start"],
          layoutEffect: options.layoutEffect ?? false,
        }
      : {
          layoutEffect: false,
        }
  )

  return {
    containerRef,
    scrollYProgress: shouldTrack ? scrollYProgress : fallbackProgress,
  }
}

