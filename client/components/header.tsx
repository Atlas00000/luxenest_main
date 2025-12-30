"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"
import { useCart } from "@/lib/cart"
import { ThemeToggle } from "@/components/theme-toggle"
import { CartPreview } from "@/components/cart-preview"
import { MAIN_NAV_ITEMS } from "@/lib/constants/navigation"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useMobile()
  const { items } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const navItems = MAIN_NAV_ITEMS

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 header-nav",
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-950/80"
          : "bg-transparent dark:bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl md:text-2xl font-bold">
              <span className="text-primary">Luxe</span>Nest
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems
              .filter((item) => !(item.name === "Login" && user)) // Hide Login if user is logged in
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative group",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.name}
                  <motion.span
                    className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform origin-left"
                    initial={{ scaleX: pathname === item.href ? 1 : 0 }}
                    animate={{ scaleX: pathname === item.href ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Search"
              className="relative overflow-hidden"
            >
              <Search className="h-5 w-5" />
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </Button>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative overflow-hidden">
                <Heart className="h-5 w-5" />
                <motion.div
                  className="absolute inset-0 bg-primary/10 rounded-full"
                  initial={{ scale: 0 }}
                  whileHover={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </Link>

            <div onMouseEnter={() => setIsCartPreviewOpen(true)} onMouseLeave={() => setIsCartPreviewOpen(false)}>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative overflow-hidden" aria-label="Cart">
                  <ShoppingBag className="h-5 w-5" />
                  {items.length > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                    >
                      {items.length}
                    </Badge>
                  )}
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-full"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>

              <AnimatePresence>{isCartPreviewOpen && items.length > 0 && <CartPreview />}</AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <ThemeToggle />

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {items.length > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    variant="destructive"
                  >
                    {items.length}
                  </Badge>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMobileMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: isMobileMenuOpen ? -90 : 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: isMobileMenuOpen ? 90 : -90 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-b py-4 bg-background/80 backdrop-blur-md theme-transition"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center">
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="flex-1 theme-transition"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-2"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-md border-b overflow-hidden theme-transition"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navItems
                  .filter((item) => !(item.name === "Login" && user)) // Hide Login if user is logged in
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium py-2 transition-colors",
                        pathname === item.href ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                <div className="h-px bg-border my-2" />
                <Button variant="ghost" size="sm" className="justify-start px-0" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="justify-start px-0">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                </Link>
                {user ? (
                  <>
                    <Link href="/account">
                      <Button variant="ghost" size="sm" className="justify-start px-0">
                        <User className="h-4 w-4 mr-2" />
                        My Account
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="justify-start px-0" onClick={logout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="justify-start px-0">
                      <User className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
