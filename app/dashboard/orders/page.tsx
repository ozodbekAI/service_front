"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ArrowUpDown, Calendar, User, Clock } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchOrders, fetchMyOrders } from "@/lib/api";

interface Order {
  id: number;
  title: string;
  status: "client_approved" | "in_process" | "completed" | "rejected";
  created_at: string;
  start_time?: string;
  estimated_completion_time?: number;
  client: {
    id: number;
    username: string;
  };
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const isManagerOrAdmin = user?.role === "manager" || user?.role === "admin";
  const isClient = !isManagerOrAdmin;

  const loadOrders = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Buyurtmalar yuklanmoqda...");
    try {
      const data = isClient ? await fetchMyOrders() : await fetchOrders();
      setOrders(data);
      setFilteredOrders(data);
      toast.success("Buyurtmalar muvaffaqiyatli yuklandi!", { id: loadingToast });
    } catch (error) {
      console.error("Buyurtmalarni yuklashda xato:", error);
      toast.error("Buyurtmalarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;
    loadOrders();
  }, [user, authLoading]);

  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh") === "true";
    if (shouldRefresh) {
      loadOrders();
      router.replace("/dashboard/orders");
    }
  }, [searchParams, router]);

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((order) => order.title.toLowerCase().includes(query));
    }
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0;
    });
    setFilteredOrders(result);
  }, [orders, statusFilter, searchQuery, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "client_approved":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Mijoz tomonidan tasdiqlangan</Badge>;
      case "in_process":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Jarayonda</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Yakunlangan</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rad etilgan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeRemaining = (order: Order) => {
    if (order.status !== "in_process" || !order.start_time || !order.estimated_completion_time) {
      return null;
    }
    const start = new Date(order.start_time);
    const end = new Date(start.getTime() + order.estimated_completion_time * 60 * 60 * 1000);
    const now = new Date();
    if (now > end) {
      return "Muddat o'tgan";
    }
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} soat ${minutes} daqiqa qoldi`;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Yuklanmoqda...</h1>
            <p className="text-muted-foreground">Iltimos, buyurtmalar yuklanishini kuting.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
            <p className="text-muted-foreground mb-4">Buyurtmalarni ko'rish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Buyurtmalar</h1>
            <p className="text-muted-foreground">Xizmat buyurtmalarini ko'rib chiqing va boshqaring</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buyurtmalarni qidirish..."
              className="pl-10 rounded-lg border border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Holati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="client_approved">Mijoz tomonidan tasdiqlangan</SelectItem>
                <SelectItem value="in_process">Jarayonda</SelectItem>
                <SelectItem value="completed">Yakunlangan</SelectItem>
                <SelectItem value="rejected">Rad etilgan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[140px] rounded-lg">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Saralash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Avval yangi</SelectItem>
                <SelectItem value="oldest">Avval eski</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Barcha buyurtmalar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </Card>
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Hech qanday buyurtma topilmadi.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{order.title}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          {order.client?.username || order.client_username || 'Noma\'lum mijoz'}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(order.created_at).toLocaleDateString("uz-UZ")}
                        </div>
                      </div>
                      {isClient && order.status === "in_process" && (
                        <div className="text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {getTimeRemaining(order) || "Hisoblanmoqda..."}
                          </div>
                        </div>
                      )}
                      <Link href={`/dashboard/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="w-full rounded-lg">
                          Tafsilotlarni ko'rish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
