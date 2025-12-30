"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  BarChart3,
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle,
  Download,
  Copy,
  FileText,
  Settings,
  Bell,
  Search,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAdminStats, getAdminOrders, getAdminUsers, getAdminProducts, type AdminStats } from "@/lib/api/admin"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function AdminDashboard() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("30d")
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role !== "ADMIN") {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      })
      router.push("/")
      return
    }
  }, [isAuthenticated, user, router, toast])

  // Load stats
  useEffect(() => {
    if (user?.role !== "ADMIN") return

    const loadStats = async () => {
      try {
        const statsData = await getAdminStats(dateRange)
        setStats(statsData)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load statistics",
          variant: "destructive",
        })
      }
    }

    loadStats()
  }, [dateRange, user, toast])

  // Load orders
  useEffect(() => {
    if (user?.role !== "ADMIN") return

    const loadOrders = async () => {
      try {
        const result = await getAdminOrders(1, 5)
        setOrders(result.data)
      } catch (error: any) {
        console.error("Failed to load orders:", error)
      }
    }

    loadOrders()
  }, [user])

  // Load users
  useEffect(() => {
    if (user?.role !== "ADMIN") return

    const loadUsers = async () => {
      try {
        const result = await getAdminUsers(1, 5)
        setUsers(result.data)
      } catch (error: any) {
        console.error("Failed to load users:", error)
      }
    }

    loadUsers()
  }, [user])

  // Load products
  useEffect(() => {
    if (user?.role !== "ADMIN") return

    const loadProducts = async () => {
      try {
        const result = await getAdminProducts(1, 5)
        setProducts(result.data)
      } catch (error: any) {
        console.error("Failed to load products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [user])

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatGrowth = (growth: number) => {
    const sign = growth >= 0 ? "+" : ""
    const color = growth >= 0 ? "text-green-500" : "text-red-500"
    return (
      <span className={color}>
        {sign}{growth.toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[200px] pl-8"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Date Range Selector */}
        <div className="mb-6 flex items-center justify-between">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatGrowth(stats.revenue.growth)} from last period
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg order: {formatCurrency(stats.revenue.averageOrderValue)}
                </p>
              </CardContent>
            </Card>
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.users.new} new in selected period
                </p>
              </CardContent>
            </Card>
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.orders.recent} in selected period
                </p>
              </CardContent>
            </Card>
            <Card className="luxury-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.products.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.products.lowStock} low stock
                  {stats.products.lowStock > 0 && (
                    <AlertCircle className="inline h-3 w-3 ml-1 text-yellow-600" />
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Analytics Chart */}
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>Revenue and sales over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full bg-muted/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Chart Placeholder</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="luxury-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest customer orders</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("orders")}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell>{order.user.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>Manage and track all orders</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell>{order.user.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user._count.orders}</TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>All Products</CardTitle>
                <CardDescription>Manage product inventory</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Reviews</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category.name}</TableCell>
                          <TableCell>
                            <span className={cn(
                              product.stock < 10 && "text-red-600 font-medium"
                            )}>
                              {product.stock}
                            </span>
                          </TableCell>
                          <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                          <TableCell>{product._count.reviews}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No products found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
