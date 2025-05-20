"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ClipboardList, Users, Package, DollarSign, TrendingUp, Calendar } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "react-hot-toast";
import {
  fetchDashboardStats,
  fetchWeeklyStats,
  fetchOrders,
  fetchProductCategories,
  fetchTopSellingProducts,
  fetchUserManagementStats,
  fetchUserGrowth,
  fetchOrderStatusDistribution,
} from "@/lib/api";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function StatistikalarSahifasi() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("haftalik");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState({
    jami_buyurtmalar: 0,
    jami_mijozlar: 0,
    bajarilgan_buyurtmalar: 0,
    taxminiy_narx__jami: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState<
    { name: string; buyurtmalar: number; bajarilgan: number; rad_etilgan: number }[]
  >([]);
  const [productCategories, setProductCategories] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [userManagementStats, setUserManagementStats] = useState({
    jami_foydalanuvchilar: 0,
    mijozlar: 0,
    menejerlar: 0,
    adminlar: 0,
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager" || isAdmin;

  useEffect(() => {
    if (!isManager) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Dashboard statistikasini olish
        const dashboardData = await fetchDashboardStats();
        setDashboardStats({
          jami_buyurtmalar: dashboardData.total_orders,
          jami_mijozlar: dashboardData.total_clients,
          bajarilgan_buyurtmalar: dashboardData.completed_orders,
          taxminiy_narx__jami: dashboardData.estimated_price__sum,
        });
        toast.success("Dashboard statistikasi muvaffaqiyatli yuklandi!");

        // Haftalik statistikani olish
        try {
          const weeklyData = await fetchWeeklyStats();
          setWeeklyStats(
            weeklyData.map((item: any) => ({
              name: new Date(item.date).toLocaleDateString("uz-UZ", { weekday: "short" }),
              buyurtmalar: item.total_orders || 0,
              bajarilgan: item.completed_orders || 0,
              rad_etilgan: item.rejected_orders || 0,
            }))
          );
        } catch (err) {
          console.error("Haftalik statistika xatosi:", err);
          setError("Haftalik statistikani yuklashda xato yuz berdi.");
          toast.error("Haftalik statistikani yuklashda xato!");
        }

        // Oylik statistikani olish
        try {
          const ordersData = await fetchOrders();
          const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - 11 + i);
            const monthName = date.toLocaleDateString("uz-UZ", { month: "short" });
            const monthOrders = ordersData.filter(
              (order: any) =>
                new Date(order.created_at).getMonth() === date.getMonth() &&
                new Date(order.created_at).getFullYear() === date.getFullYear()
            );
            return {
              name: monthName,
              buyurtmalar: monthOrders.length,
              bajarilgan: monthOrders.filter((order: any) => order.status === "bajarilgan").length,
              rad_etilgan: monthOrders.filter((order: any) => order.status === "rad_etilgan").length,
            };
          });
          setMonthlyStats(monthlyData);
        } catch (err) {
          console.error("Oylik statistika xatosi:", err);
          setError("Oylik statistikani yuklashda xato yuz berdi.");
          toast.error("Oylik statistikani yuklashda xato!");
        }

        // Mahsulot kategoriyalarini olish
        try {
          const categoriesData = await fetchProductCategories();
          setProductCategories(
            categoriesData.map((category: any) => ({
              name: category.name,
              value: category.products_count || 0,
            }))
          );
        } catch (err) {
          console.error("Mahsulot kategoriyalari xatosi:", err);
          setError("Mahsulot kategoriyalarini yuklashda xato yuz berdi.");
          toast.error("Mahsulot kategoriyalarini yuklashda xato!");
        }

        // Eng ko‘p sotilgan mahsulotlarni olish
        try {
          const topProductsData = await fetchTopSellingProducts();
          setTopSellingProducts(topProductsData);
        } catch (err) {
          console.error("Eng ko‘p sotilgan mahsulotlar xatosi:", err);
          setError("Eng ko‘p sotilgan mahsulotlarni yuklashda xato yuz berdi.");
          toast.error("Eng ko‘p sotilgan mahsulotlarni yuklashda xato!");
        }

        // Foydalanuvchi boshqaruvi statistikasini olish
        try {
          const userStats = await fetchUserManagementStats();
          setUserManagementStats({
            jami_foydalanuvchilar: userStats.total_users,
            mijozlar: userStats.clients,
            menejerlar: userStats.managers,
            adminlar: userStats.admins,
          });
        } catch (err) {
          console.error("Foydalanuvchi boshqaruvi statistikasi xatosi:", err);
          setError("Foydalanuvchi boshqaruvi statistikasini yuklashda xato yuz berdi.");
          toast.error("Foydalanuvchi boshqaruvi statistikasini yuklashda xato!");
        }

        // Foydalanuvchi o‘sishi statistikasini olish
        try {
          const userGrowthData = await fetchUserGrowth();
          setUserGrowth(userGrowthData);
        } catch (err) {
          console.error("Foydalanuvchi o‘sishi xatosi:", err);
          setError("Foydalanuvchi o‘sishi ma’lumotlarini yuklashda xato yuz berdi.");
          toast.error("Foydalanuvchi o‘sishi ma’lumotlarini yuklashda xato!");
        }

        // Buyurtma holati taqsimotini olish
        try {
          const statusData = await fetchOrderStatusDistribution();
          setOrderStatusDistribution(statusData);
        } catch (err) {
          console.error("Buyurtma holati taqsimoti xatosi:", err);
          setError("Buyurtma holati taqsimotini yuklashda xato yuz berdi.");
          toast.error("Buyurtma holati taqsimotini yuklashda xato!");
        }
      } catch (error) {
        console.error("Umumiy statistikani yuklash xatosi:", error);
        setError("Statistikani yuklashda xato yuz berdi.");
        toast.error("Statistikani yuklashda umumiy xato!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isManager]);

  if (!isManager) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Kirish taqiqlangan</h1>
            <p className="text-muted-foreground mb-4">Sizda ushbu sahifani ko‘rish uchun ruxsat yo‘q.</p>
            <Link href="/dashboard">
              <Button>Boshqaruv paneliga qaytish</Button>
            </Link>
          </div>
        </div>
        <Toaster />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistika</h1>
          <p className="text-muted-foreground">Tizim samaradorligi va tendensiyalarni tahlil qilish</p>
        </div>

        {isLoading ? (
          <div>Yuklanmoqda...</div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jami buyurtmalar</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.jami_buyurtmalar}</div>
                  <p className="text-xs text-muted-foreground">O‘tgan oydan +12%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Jami mijozlar</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.jami_mijozlar}</div>
                  <p className="text-xs text-muted-foreground">Bu oyda +4 yangi mijoz</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sotilgan mahsulotlar</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.bajarilgan_buyurtmalar}</div>
                  <p className="text-xs text-muted-foreground">O‘tgan oydan +18%</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daromad</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(dashboardStats.taxminiy_narx__jami || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">O‘tgan oydan +8%</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="buyurtmalar" className="space-y-4">
              <TabsList>
                <TabsTrigger value="buyurtmalar">Buyurtmalar</TabsTrigger>
                <TabsTrigger value="mahsulotlar">Mahsulotlar</TabsTrigger>
                <TabsTrigger value="foydalanuvchilar">Foydalanuvchilar</TabsTrigger>
              </TabsList>

              <TabsContent value="buyurtmalar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>Buyurtmalar statistikasi</CardTitle>
                        <CardDescription>Buyurtmalar tendensiyalari haqida umumiy ma’lumot</CardDescription>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        <Button
                          variant={timeRange === "haftalik" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange("haftalik")}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Haftalik
                        </Button>
                        <Button
                          variant={timeRange === "oylik" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTimeRange("oylik")}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Oylik
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(timeRange === "haftalik" ? weeklyStats : monthlyStats).length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={timeRange === "haftalik" ? weeklyStats : monthlyStats}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="buyurtmalar" fill="#3b82f6" name="Jami buyurtmalar" />
                            <Bar dataKey="bajarilgan" fill="#10b981" name="Bajarilgan" />
                            <Bar dataKey="rad_etilgan" fill="#ef4444" name="Rad etilgan" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">Buyurtmalar ma’lumotlari mavjud emas.</div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Buyurtma bajarilish darajasi</CardTitle>
                      <CardDescription>Buyurtmalarning muvaffaqiyatli bajarilgan foizi</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(timeRange === "haftalik" ? weeklyStats : monthlyStats).length > 0 ? (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={timeRange === "haftalik" ? weeklyStats : monthlyStats}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="bajarilgan"
                                stroke="#10b981"
                                activeDot={{ r: 8 }}
                                name="Bajarilgan buyurtmalar"
                              />
                              <Line
                                type="monotone"
                                dataKey="buyurtmalar"
                                stroke="#3b82f6"
                                name="Jami buyurtmalar"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">Buyurtmalar ma’lumotlari mavjud emas.</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Buyurtma holati taqsimoti</CardTitle>
                      <CardDescription>Barcha buyurtmalarning joriy holati</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {orderStatusDistribution.length > 0 ? (
                        <div className="h-[300px] flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={orderStatusDistribution.filter((entry: any) => entry.value > 0)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {orderStatusDistribution
                                  .filter((entry: any) => entry.value > 0)
                                  .map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground">Buyurtma holati ma’lumotlari mavjud emas.</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="mahsulotlar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mahsulot kategoriyalari taqsimoti</CardTitle>
                    <CardDescription>Mahsulotlarning kategoriyalar bo‘yicha taqsimoti</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {productCategories.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={productCategories.filter((entry: any) => entry.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {productCategories
                                .filter((entry: any) => entry.value > 0)
                                .map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">Mahsulot kategoriyalari ma’lumotlari mavjud emas.</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Eng ko‘p sotilgan mahsulotlar</CardTitle>
                    <CardDescription>Sotuv hajmi bo‘yicha eng mashhur mahsulotlar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topSellingProducts.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={topSellingProducts}
                            layout="vertical"
                            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sales" fill="#3b82f6" name="Sotilgan birliklar" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">Eng ko‘p sotilgan mahsulotlar ma’lumotlari mavjud emas.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="foydalanuvchilar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Foydalanuvchilar o‘sishi</CardTitle>
                    <CardDescription>Vaqt o‘tishi bilan yangi foydalanuvchilar ro‘yxatdan o‘tishi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userGrowth.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={userGrowth}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="users"
                              stroke="#3b82f6"
                              activeDot={{ r: 8 }}
                              name="Jami foydalanuvchilar"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">Foydalanuvchilar o‘sishi ma’lumotlari mavjud emas.</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Foydalanuvchi rollari taqsimoti</CardTitle>
                    <CardDescription>Foydalanuvchilarning rollar bo‘yicha taqsimoti</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userManagementStats.mijozlar + userManagementStats.menejerlar + userManagementStats.adminlar > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Mijozlar", value: userManagementStats.mijozlar },
                                { name: "Menejerlar", value: userManagementStats.menejerlar },
                                { name: "Adminlar", value: userManagementStats.adminlar },
                              ].filter((entry) => entry.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: "Mijozlar", value: userManagementStats.mijozlar, color: "#10b981" },
                                { name: "Menejerlar", value: userManagementStats.menejerlar, color: "#3b82f6" },
                                { name: "Adminlar", value: userManagementStats.adminlar, color: "#ef4444" },
                              ]
                                .filter((entry) => entry.value > 0)
                                .map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">Foydalanuvchi rollari ma’lumotlari mavjud emas.</div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
        <Toaster />
      </div>
    </DashboardLayout>
  );
}