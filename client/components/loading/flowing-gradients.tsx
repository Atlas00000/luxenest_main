"use client"

import { motion } from "framer-motion"

export function FlowingGradients() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary Gold Gradient Flow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse at 20% 50%, rgba(191, 149, 63, 0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 80% 50%, rgba(191, 149, 63, 0.25) 0%, transparent 50%)",
            "radial-gradient(ellipse at 50% 20%, rgba(191, 149, 63, 0.2) 0%, transparent 50%)",
            "radial-gradient(ellipse at 20% 50%, rgba(191, 149, 63, 0.2) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Accent Flow */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(ellipse at 80% 80%, rgba(191, 149, 63, 0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse at 20% 20%, rgba(191, 149, 63, 0.15) 0%, transparent 60%)",
            "radial-gradient(ellipse at 80% 80%, rgba(191, 149, 63, 0.15) 0%, transparent 60%)",
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Dark Mode Accent */}
      <motion.div
        className="absolute inset-0 dark:block hidden"
        animate={{
          background: [
            "radial-gradient(ellipse at 50% 50%, rgba(24, 24, 27, 0.4) 0%, transparent 70%)",
            "radial-gradient(ellipse at 30% 70%, rgba(24, 24, 27, 0.4) 0%, transparent 70%)",
            "radial-gradient(ellipse at 50% 50%, rgba(24, 24, 27, 0.4) 0%, transparent 70%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Animated Mesh Gradient Overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            linear-gradient(135deg, transparent 0%, rgba(191, 149, 63, 0.1) 50%, transparent 100%),
            linear-gradient(45deg, transparent 0%, rgba(191, 149, 63, 0.05) 50%, transparent 100%)
          `,
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}

