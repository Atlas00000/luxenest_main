"use client"

import { useMobile } from "@/hooks/use-mobile"
import { MobileHomepage } from "./mobile-homepage"
import { DesktopHomepage } from "./desktop-homepage"

/**
 * Responsive Homepage Component
 * Automatically switches between mobile and desktop layouts
 * Uses the current mobile view as the dedicated mobile structure
 */
export function ResponsiveHomepage() {
  const isMobile = useMobile()

  // Render mobile layout (current mobile view structure)
  if (isMobile) {
    return <MobileHomepage />
  }

  // Render desktop layout
  return <DesktopHomepage />
}

