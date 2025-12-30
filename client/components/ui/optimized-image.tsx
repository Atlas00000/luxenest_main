"use client"

import { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined
  fallback?: string
}

/**
 * Optimized Image component with error handling
 * Automatically falls back to placeholder if image fails to load
 */
export function OptimizedImage({ 
  src, 
  fallback = "/placeholder.svg",
  alt,
  ...props 
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallback)
  const [hasError, setHasError] = useState(false)

  // Update src when prop changes
  useEffect(() => {
    if (src && !hasError) {
      setImgSrc(src)
    }
  }, [src, hasError])

  // Use a wrapper div to detect image load errors
  // Next.js Image doesn't support onError directly, so we use a fallback approach
  if (hasError || !src) {
    return (
      <Image
        {...props}
        src={fallback}
        alt={alt || ""}
      />
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Image
        {...props}
        src={imgSrc}
        alt={alt || ""}
        onLoadingComplete={(result) => {
          // Check if image loaded successfully
          if (result.naturalWidth === 0) {
            setHasError(true)
            setImgSrc(fallback)
          }
          props.onLoadingComplete?.(result)
        }}
        onError={() => {
          if (!hasError) {
            setHasError(true)
            setImgSrc(fallback)
          }
        }}
      />
    </div>
  )
}

