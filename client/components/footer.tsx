import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SHOP_NAV_ITEMS, COMPANY_NAV_ITEMS, HELP_NAV_ITEMS } from "@/lib/constants/navigation"

export default function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">LuxeNest</h3>
            <p className="text-sm text-muted-foreground">Premium home decor and furniture for the modern lifestyle.</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              {SHOP_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="space-y-2 text-sm">
              {COMPANY_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <span className="text-muted-foreground/60 cursor-not-allowed" title={item.description || "Coming soon"}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Help</h3>
            <ul className="space-y-2 text-sm">
              {HELP_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <span className="text-muted-foreground/60 cursor-not-allowed" title={item.description || "Coming soon"}>
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LuxeNest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
