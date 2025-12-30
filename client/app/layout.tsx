import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { LoadingScreen } from "@/components/loading-screen"
import { LoadingContentWrapper } from "@/components/loading-content-wrapper"
import "./globals.css"
import { CartProvider } from "@/lib/cart"
import { WishlistProvider } from "@/lib/wishlist"
import { LoadingProvider } from "@/lib/loading-context"
import { cn } from "@/lib/utils"
import { fontSans } from "@/lib/fonts"

export const metadata = {
  title: "LuxeNest | Premium Home Decor",
  description: "Discover premium home decor and furniture at LuxeNest",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingProvider>
            <LoadingScreen />
            <LoadingContentWrapper>
              <AuthProvider>
                <CartProvider>
                  <WishlistProvider>
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </WishlistProvider>
                </CartProvider>
              </AuthProvider>
            </LoadingContentWrapper>
          </LoadingProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
