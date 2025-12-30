"use client"

import { ResponsiveHomepage } from "@/components/homepage/responsive-homepage"

/**
 * Home Page
 * Uses responsive layout system that automatically switches between
 * mobile and desktop layouts based on screen size.
 * 
 * Mobile layout: Uses the current mobile view structure (gap-6, optimized spacing)
 * Desktop layout: Uses larger spacing and desktop-optimized layouts
 */
export default function Home() {
  return <ResponsiveHomepage />
}
