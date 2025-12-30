"use client"

import { useLoading } from "@/lib/loading-context"
import { motion } from "framer-motion"

export function LoadingContentWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0 : 1 }}
      transition={{ duration: 0.6, delay: isLoading ? 0 : 0.3 }}
      style={{ visibility: isLoading ? "hidden" : "visible" }}
    >
      {children}
    </motion.div>
  )
}

