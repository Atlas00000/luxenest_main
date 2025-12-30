"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionShellProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  eyebrow?: string
}

export function SectionShell({
  title,
  subtitle,
  eyebrow,
  className,
  children,
  ...props
}: SectionShellProps) {
  return (
    <section
      className={cn(
        "theme-transition py-16 md:py-20",
        "border-t border-border/60",
        "bg-background",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4">
        {(eyebrow || title || subtitle) && (
          <header className="mb-8 md:mb-12 max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-primary">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="text-sm md:text-base text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </header>
        )}
        <div>{children}</div>
      </div>
    </section>
  )
}


