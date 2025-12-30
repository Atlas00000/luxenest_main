"use client"

import { ReactNode } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface MobileLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Mobile Layout Wrapper
 * Provides mobile-optimized spacing and layout structure
 * Uses the current mobile view as the dedicated mobile structure
 */
export function MobileLayout({ children, className }: MobileLayoutProps) {
  const isMobile = useMobile()

  return (
    <div
      className={cn(
        "flex flex-col",
        // Mobile-first spacing (current mobile view)
        "gap-6 px-4 py-6",
        // Desktop spacing (when not mobile)
        !isMobile && "md:gap-16 md:px-0 md:py-0",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Mobile Section Wrapper
 * Optimized spacing and padding for mobile sections
 */
export function MobileSection({ 
  children, 
  className,
  fullWidth = false 
}: { 
  children: ReactNode
  className?: string
  fullWidth?: boolean 
}) {
  const isMobile = useMobile()

  return (
    <section
      className={cn(
        "w-full",
        // Mobile: full width with padding
        isMobile && "px-0",
        // Desktop: container with max-width
        !isMobile && !fullWidth && "container mx-auto px-4",
        className
      )}
    >
      {children}
    </section>
  )
}

