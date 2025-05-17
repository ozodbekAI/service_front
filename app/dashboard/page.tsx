"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClipboardList, Package, Users, CheckCircle, Clock, Plus, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/use-auth"
import { fetchDashboardStats, fetchPendingOrders, fetchLowStockProducts } from "@/lib/api"

interface DashboardStats {
  total_clients: number
  total_orders: number
  accepted_orders: number
  rejected_orders: number
  completed_orders: number
  pending_orders: number
}

interface Order {
  id: number
  title: string
  problem_description: string
  status: string
  created_at: string
  client: {
    username: string
    email: string
  }
}

interface Product {
  id: number
  name: string
  price: number | string // Allow price to be number or string
  quantity: number | string // Allow quantity to be number or string
  category?: {
    id: number
    name: string
  }
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      try {
        if (user?.role === "admin" || user?.role === "manager") {
          const statsData = await fetchDashboardStats()
          setStats(statsData)

          const ordersData = await fetchPendingOrders()
          setPendingOrders(ordersData)

          const productsData = await fetchLowStockProducts()
          setLowStockProducts(productsData)
        } else {
          // For regular users, we'd fetch their orders
          // This would be implemented in a real application
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  // For demo purposes, we'll use placeholder data if the API calls aren't implemented
  useEffect(() => {
    if (isLoading && !stats) {
      // Placeholder data
      setStats({
        total_clients: 25,
        total_orders: 100,
        accepted_orders: 30,
        rejected_orders: 10,
        completed_orders: 40,
        pending_orders: 20,
      })

      setPendingOrders([
        {
          id: 1,
          title: "Laptop won't turn on",
          problem_description: "My laptop suddenly stopped turning on yesterday.",
          status: "pending",
          created_at: "2023-05-15T10:30:00Z",
          client: {
            username: "john_doe",
            email: "john@example.com",
          },
        },
        {
          id: 2,
          title: "Blue screen error",
          problem_description: "Getting blue screen error when starting Windows.",
          status: "pending",
          created_at: "2023-05-14T14:20:00Z",
          client: {
            username: "jane_smith",
            email: "jane@example.com",
          },
        },
      ])

      setLowStockProducts([
        {
          id: 1,
          name: "SSD 500GB",
          price: 89.99,
          quantity: 3,
          category: {
            id: 1,
            name: "Storage",
          },
        },
        {
          id: 2,
          name: "RAM 16GB DDR4",
          price: 75.5,
          quantity: 2,
          category: {
            id: 2,
            name: "Memory",
          },
        },
      ])

      setIsLoading(false)
    }
  }, [isLoading, stats])

  const isAdmin = user?.role === "admin"
  const isManager = user?.role === "manager" || isAdmin
  const isClient = user?.role === "user"

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.username}!</p>
        </div>

        {(isAdmin || isManager) && stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <p className="text-xs text-muted-foreground">{stats.pending_orders} pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.completed_orders / stats.total_orders) * 100)}% completion rate
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_clients}</div>
                <p className="text-xs text-muted-foreground">Active users in the system</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats.accepted_orders / (stats.accepted_orders + stats.rejected_orders)) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.accepted_orders} accepted, {stats.rejected_orders} rejected
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {(isAdmin || isManager) && (
              <>
                <TabsTrigger value="pending-orders">Pending Orders</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
              </>
            )}
            {isClient && <TabsTrigger value="my-orders">My Orders</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isClient && (
                    <Link href="/dashboard/orders/new">
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Order
                      </Button>
                    </Link>
                  )}
                  {(isAdmin || isManager) && (
                    <>
                      <Link href="/dashboard/orders">
                        <Button className="w-full mb-2">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Manage Orders
                        </Button>
                      </Link>
                      <Link href="/dashboard/products">
                        <Button className="w-full">
                          <Package className="mr-2 h-4 w-4" />
                          Manage Products
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Overview</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">System Status</span>
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" /> Operational
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Status</span>
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" /> Operational
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status</span>
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" /> Operational
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Logged in</p>
                        <p className="text-sm text-muted-foreground">Just now</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Viewed dashboard</p>
                        <p className="text-sm text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {(isAdmin || isManager) && (
            <TabsContent value="pending-orders" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Pending Orders</CardTitle>
                    <CardDescription>Orders waiting for manager approval</CardDescription>
                  </div>
                  <Link href="/dashboard/orders?status=pending">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {pendingOrders.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No pending orders at the moment.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingOrders.map((order) => (
                        <div key={order.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{order.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">{order.problem_description}</p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">From: {order.client.username}</span>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(isAdmin || isManager) && (
            <TabsContent value="low-stock" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Low Stock Products</CardTitle>
                    <CardDescription>Products that need to be restocked soon</CardDescription>
                  </div>
                  <Link href="/dashboard/products?filter=low-stock">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">All products are well-stocked.</p>
                  ) : (
                    <div className="space-y-4">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Category: {product.category ? product.category.name : "Uncategorized"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              $
                              {typeof product.price === "number"
                                ? product.price.toFixed(2)
                                : Number.parseFloat(String(product.price || 0)).toFixed(2)}
                            </p>
                            <p className="text-sm text-red-500">
                              Only{" "}
                              {typeof product.quantity === "number"
                                ? product.quantity
                                : Number.parseInt(String(product.quantity || 0), 10)}{" "}
                              left
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isClient && (
            <TabsContent value="my-orders" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Recent Orders</CardTitle>
                    <CardDescription>Your recent service requests</CardDescription>
                  </div>
                  <Link href="/dashboard/orders">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">You don&apos;t have any orders yet.</p>
                  <div className="flex justify-center">
                    <Link href="/dashboard/orders/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Order
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
