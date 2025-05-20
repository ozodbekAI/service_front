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
import toast from "react-hot-toast" // react-hot-toast import
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
  price: number | string
  quantity: number | string
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
      const loadingToast = toast.loading("Ma'lumotlar yuklanmoqda...") // Loading toast
      try {
        if (user?.role === "admin" || user?.role === "manager") {
          const statsData = await fetchDashboardStats()
          setStats(statsData)

          const ordersData = await fetchPendingOrders()
          setPendingOrders(ordersData)

          const productsData = await fetchLowStockProducts()
          setLowStockProducts(productsData)

          toast.success("Boshqaruv paneli ma'lumotlari muvaffaqiyatli yuklandi!", {
            id: loadingToast,
          }) // Success toast
        } else {
          // Mijozlar uchun buyurtmalar olinadi (haqiqiy ilovada amalga oshiriladi)
          toast.success("Mijoz ma'lumotlari yuklandi!", {
            id: loadingToast,
          })
        }
      } catch (error) {
        console.error("Boshqaruv paneli ma'lumotlarini yuklashda xato:", error)
        toast.error("Ma'lumotlarni yuklashda xato yuz berdi.", {
          id: loadingToast,
        }) // Error toast
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadDashboardData()
    }
  }, [user])

  // Demo maqsadida, agar API chaqiruvlari amalga oshirilmagan bo'lsa, placeholder ma'lumotlardan foydalanamiz
  useEffect(() => {
    if (isLoading && !stats) {
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
          title: "Noutbuk yoqilmayapti",
          problem_description: "Noutbukim kecha to'satdan yoqilmay qoldi.",
          status: "pending",
          created_at: "2023-05-15T10:30:00Z",
          client: {
            username: "john_doe",
            email: "john@example.com",
          },
        },
        {
          id: 2,
          title: "Ko'k ekran xatosi",
          problem_description: "Windows ishga tushganda ko'k ekran xatosi chiqyapti.",
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
            name: "Saqlash",
          },
        },
        {
          id: 2,
          name: "RAM 16GB DDR4",
          price: 75.5,
          quantity: 2,
          category: {
            id: 2,
            name: "Xotira",
          },
        },
      ])

      setIsLoading(false)
      toast.success("Namunaviy ma'lumotlar yuklandi!") // Success toast for placeholder data
    }
  }, [isLoading, stats])

  const isAdmin = user?.role === "admin"
  const isManager = user?.role === "manager" || isAdmin
  const isClient = user?.role === "client"

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Boshqaruv paneli</h1>
          <p className="text-muted-foreground">Xush kelibsiz, {user?.username}!</p>
        </div>

        {(isAdmin || isManager) && stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami buyurtmalar</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_orders}</div>
                <p className="text-xs text-muted-foreground">{stats.pending_orders} kutilmoqda</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bajarilgan buyurtmalar</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed_orders}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.completed_orders / stats.total_orders) * 100)}% bajarilish darajasi
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Jami mijozlar</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_clients}</div>
                <p className="text-xs text-muted-foreground">Tizimdagi faol foydalanuvchilar</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qabul qilish darajasi</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.accepted_orders + stats.rejected_orders > 0 
                    ? Math.round((stats.accepted_orders / (stats.accepted_orders + stats.rejected_orders)) * 100) 
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.accepted_orders} qabul qilingan, {stats.rejected_orders} rad etilgan
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Umumiy ko'rinish</TabsTrigger>
            {(isAdmin || isManager) && (
              <>
                <TabsTrigger value="pending-orders">Kutilayotgan buyurtmalar</TabsTrigger>
                <TabsTrigger value="low-stock">Kam zaxira mahsulotlar</TabsTrigger>
              </>
            )}
            {isClient && <TabsTrigger value="my-orders">Mening buyurtmalarim</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Tezkor amallar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isClient && (
                    <Link href="/dashboard/announcements/new">
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Yangi e'lon yaratish
                      </Button>
                    </Link>
                  )}
                  {(isAdmin || isManager) && (
                    <>
                      <Link href="/dashboard/orders">
                        <Button className="w-full mb-2">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Buyurtmalarni boshqarish
                        </Button>
                      </Link>
                      <Link href="/dashboard/products">
                        <Button className="w-full">
                          <Package className="mr-2 h-4 w-4" />
                          Mahsulotlarni boshqarish
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Holati haqida umumiy ma'lumot</CardTitle>
                  <CardDescription>Tizimning joriy holati</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tizim holati</span>
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" /> Faol
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API holati</span>
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" /> Faol
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ma'lumotlar bazasi holati</span>
                      <span className="text-sm font-medium text-green-500 flex items-center">
                        <CheckCircle className="mr-1 h-3 w-3" /> Faol
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>So'nggi faoliyat</CardTitle>
                  <CardDescription>Sizning so'nggi amallaringiz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Tizimga kirdi</p>
                        <p className="text-sm text-muted-foreground">Hozir</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Boshqaruv panelini ko'rdi</p>
                        <p className="text-sm text-muted-foreground">2 daqiqa oldin</p>
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
                    <CardTitle>Kutilayotgan buyurtmalar</CardTitle>
                    <CardDescription>Menejer tasdiqlashini kutayotgan buyurtmalar</CardDescription>
                  </div>
                  <Link href="/dashboard/orders?status=pending">
                    <Button variant="outline" size="sm">
                      Hammasini ko'rish
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {pendingOrders.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Hozirda kutilayotgan buyurtmalar yo'q.</p>
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
                              Kutilmoqda
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Mijoz: {order.client.username}</span>
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">
                                Tafsilotlarni ko'rish
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
                    <CardTitle>Kam zaxira mahsulotlar</CardTitle>
                    <CardDescription>Tez orada qayta zaxiralanishi kerak bo'lgan mahsulotlar</CardDescription>
                  </div>
                  <Link href="/dashboard/products?filter=low-stock">
                    <Button variant="outline" size="sm">
                      Hammasini ko'rish
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">Barcha mahsulotlar yetarli zaxirada.</p>
                  ) : (
                    <div className="space-y-4">
                      {lowStockProducts.map((product) => (
                        <div key={product.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Kategoriya: {product.category ? product.category.name : "Kategoriyasiz"}
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
                              Faqat{" "}
                              {typeof product.quantity === "number"
                                ? product.quantity
                                : Number.parseInt(String(product.quantity || 0), 10)}{" "}
                              dona qoldi
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
                    <CardTitle>Mening so'nggi buyurtmalarim</CardTitle>
                    <CardDescription>Sizning so'nggi xizmat so'rovlaringiz</CardDescription>
                  </div>
                  <Link href="/dashboard/orders">
                    <Button variant="outline" size="sm">
                      Hammasini ko'rish
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-4 text-muted-foreground">Sizda hali buyurtmalar yo'q.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}