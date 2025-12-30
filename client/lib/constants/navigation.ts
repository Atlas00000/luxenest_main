/**
 * Navigation constants
 * Centralized navigation configuration for consistency across the app
 */

export interface NavItem {
  name: string;
  href: string;
  description?: string;
}

/**
 * Main navigation items (header)
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Sale", href: "/sales" },
  { name: "Login", href: "/login" },
];

/**
 * Shop navigation items (footer)
 */
export const SHOP_NAV_ITEMS: NavItem[] = [
  { name: "All Products", href: "/products" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Sale", href: "/sales" },
];

/**
 * Company navigation items (footer)
 * Note: These pages don't exist yet - links are disabled or can be added later
 */
export const COMPANY_NAV_ITEMS: NavItem[] = [
  { name: "About Us", href: "/about", description: "Coming soon" },
  { name: "Sustainability", href: "/sustainability", description: "Coming soon" },
  { name: "Careers", href: "/careers", description: "Coming soon" },
  { name: "Contact Us", href: "/contact", description: "Coming soon" },
];

/**
 * Help/Support navigation items (footer)
 * Note: These pages don't exist yet - links are disabled or can be added later
 */
export const HELP_NAV_ITEMS: NavItem[] = [
  { name: "Shipping & Returns", href: "/shipping", description: "Coming soon" },
  { name: "FAQ", href: "/faq", description: "Coming soon" },
  { name: "Privacy Policy", href: "/privacy", description: "Coming soon" },
  { name: "Terms & Conditions", href: "/terms", description: "Coming soon" },
];

/**
 * User account navigation items
 */
export const ACCOUNT_NAV_ITEMS: NavItem[] = [
  { name: "My Account", href: "/account" },
  { name: "Orders", href: "/orders" },
  { name: "Wishlist", href: "/wishlist" },
  { name: "Cart", href: "/cart" },
];

/**
 * Check if a route exists
 */
export const routeExists = (href: string): boolean => {
  // List of existing routes
  const existingRoutes = [
    "/",
    "/products",
    "/products/[id]",
    "/categories",
    "/new-arrivals",
    "/sales",
    "/cart",
    "/checkout",
    "/wishlist",
    "/orders",
    "/orders/[id]",
    "/login",
    "/admin",
  ];

  // Check exact match
  if (existingRoutes.includes(href)) {
    return true;
  }

  // Check dynamic routes
  if (href.startsWith("/products/") && href !== "/products") {
    return true; // Dynamic product route
  }

  if (href.startsWith("/orders/") && href !== "/orders") {
    return true; // Dynamic order route
  }

  return false;
};

