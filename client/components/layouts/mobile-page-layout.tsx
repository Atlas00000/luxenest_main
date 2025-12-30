"use client"

import { ReactNode } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface MobilePageLayoutProps {
  children: ReactNode
  className?: string
  container?: boolean
}

/**
 * Mobile Page Layout
 * Provides consistent mobile-optimized page structure
 * Uses mobile-first spacing that looks good on mobile
 */
export function MobilePageLayout({ 
  children, 
  className,
  container = true 
}: MobilePageLayoutProps) {
  const isMobile = useMobile()

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen",
        // Mobile-first spacing (current mobile view)
        "gap-4 px-4 py-6",
        // Desktop spacing
        !isMobile && "md:gap-8 md:px-0 md:py-8",
        // Container on desktop
        !isMobile && container && "md:container md:mx-auto",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Mobile Page Header
 * Optimized header for mobile pages
 */
export function MobilePageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  className?: string
}) {
  const isMobile = useMobile()

  return (
    <div className={cn("mb-6", !isMobile && "md:mb-8", className)}>
      {eyebrow && (
        <div className="flex items-center gap-2 mb-2">
          <div className="h-0.5 w-6 md:w-8 bg-primary" />
          <span className="text-xs md:text-sm text-primary font-medium uppercase tracking-wider">
            {eyebrow}
          </span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className={cn(
            "text-2xl md:text-4xl font-bold tracking-tight mb-2",
            isMobile && "text-2xl"
          )}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(
              "text-muted-foreground",
              isMobile ? "text-sm" : "text-base"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Mobile Page Content
 * Content wrapper with mobile-optimized spacing
 */
export function MobilePageContent({
  children,
  className,
  fullWidth = false,
}: {
  children: ReactNode
  className?: string
  fullWidth?: boolean
}) {
  const isMobile = useMobile()

  return (
    <div
      className={cn(
        "w-full",
        // Mobile: full width
        isMobile && "px-0",
        // Desktop: container unless fullWidth
        !isMobile && !fullWidth && "container mx-auto px-4",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Mobile Section Spacing
 * Consistent spacing between sections on mobile
 */
export function MobileSection({
  children,
  className,
  spacing = "default",
}: {
  children: ReactNode
  className?: string
  spacing?: "tight" | "default" | "loose"
}) {
  const isMobile = useMobile()
  
  const spacingClasses = {
    tight: isMobile ? "mb-4" : "md:mb-6",
    default: isMobile ? "mb-6" : "md:mb-8",
    loose: isMobile ? "mb-8" : "md:mb-12",
  }

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  )
}





