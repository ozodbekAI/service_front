"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Edit, Trash2, Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchOrder, startProcessingOrder, rejectOrder, completeOrder, deleteOrder, fetchProducts, fetchWithAuth } from "@/lib/api";
import Link from "next/link";

interface Order {
  id: number;
  title: string;
  status: "client_approved" | "in_process" | "completed" | "rejected";
  created_at: string;
  updated_at: string;
  start_time?: string;
  estimated_completion_time?: number;
  estimated_price?: number;
  rejection_reason?: string;
  client: {
    id: number;
    username: string;
    email: string;
  };
  manager?: {
    id: number;
    username: string;
  };
  products: { product: { id: number; name: string }; quantity: number }[];
}

interface Product {
  id: number;
  name: string;
  quantity: number;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      const loadingToast = toast.loading("Buyurtma tafsilotlari yuklanmoqda...");
      try {
        const data = await fetchOrder(Number(id));
        console.log("Fetched Order:", data);
        setOrder(data);
        toast.success("Buyurtma tafsilotlari muvaffaqiyatli yuklandi!", { id: loadingToast });
      } catch (error: any) {
        console.error("Buyurtmani yuklashda xato:", error.message);
        toast.error("Buyurtmani yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };

    const loadProducts = async () => {
      const loadingToast = toast.loading("Mahsulotlar yuklanmoqda...");
      try {
        const data = await fetchProducts();
        setProducts(data);
        toast.success("Mahsulotlar muvaffaqiyatli yuklandi!", { id: loadingToast });
      } catch (error) {
        console.error("Mahsulotlarni yuklashda xato:", error);
        toast.error("Mahsulotlarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      }
    };

    if (authLoading || !user) return;
    loadOrder();
    if (user.role === "manager" || user.role === "admin") {
      loadProducts();
    }
  }, [id, user, authLoading]);

  const handleStartProcessing = async () => {
    const loadingToast = toast.loading("Buyurtma jarayonga qo'yilmoqda...");
    try {
      const updatedOrder = await startProcessingOrder(Number(id));
      setOrder(updatedOrder);
      toast.success("Buyurtma jarayonga qo'yildi.", { id: loadingToast });
    } catch (error) {
      console.error("Buyurtmani jarayonga qo'yishda xato:", error);
      toast.error("Buyurtmani jarayonga qo'yishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleCompleteOrder = async () => {
    const loadingToast = toast.loading("Buyurtma yakunlanmoqda...");
    try {
      const updatedOrder = await completeOrder(Number(id));
      setOrder(updatedOrder);
      toast.success("Buyurtma yakunlangan deb belgilandi.", { id: loadingToast });
    } catch (error) {
      console.error("Buyurtmani yakunlashda xato:", error);
      toast.error("Buyurtmani yakunlashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason) {
      toast.error("Iltimos, rad etish sababini kiriting.");
      return;
    }

    const loadingToast = toast.loading("Buyurtma rad etilmoqda...");
    try {
      const updatedOrder = await rejectOrder(Number(id), rejectionReason);
      setOrder(updatedOrder);
      toast.success("Buyurtma muvaffaqiyatli rad etildi.", { id: loadingToast });
    } catch (error) {
      console.error("Buyurtmani rad etishda xato:", error);
      toast.error("Buyurtmani rad etishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (confirm("Haqiqatan ham ushbu buyurtmani o'chirmoqchimisiz?")) {
      const loadingToast = toast.loading("Buyurtma o'chirilmoqda...");
      try {
        await deleteOrder(Number(id));
        toast.success("Buyurtma muvaffaqiyatli o'chirildi.", { id: loadingToast });
        router.push("/dashboard/orders");
      } catch (error) {
        console.error("Buyurtmani o'chirishda xato:", error);
        toast.error("Buyurtmani o'chirishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      }
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || !productQuantity) {
      toast.error("Iltimos, mahsulot tanlang va miqdorni kiriting.");
      return;
    }

    const loadingToast = toast.loading("Mahsulot buyurtmaga qo'shilmoqda...");
    try {
      const response = await fetchWithAuth(`/application/orders/${id}/add_product/`, {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(selectedProduct),
          quantity: Number(productQuantity),
        }),
      });
      setOrder(response);
      setSelectedProduct("");
      setProductQuantity("1");
      toast.success("Mahsulot buyurtmaga qo'shildi.", { id: loadingToast });
    } catch (error) {
      console.error("Mahsulot qo'shishda xato:", error);
      toast.error("Mahsulot qo'shishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    const loadingToast = toast.loading("Mahsulot buyurtmadan o'chirilmoqda...");
    try {
      const response = await fetchWithAuth(`/application/orders/${id}/remove_product/`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      setOrder(response);
      toast.success("Mahsulot buyurtmadan o'chirildi.", { id: loadingToast });
    } catch (error) {
      console.error("Mahsulot o'chirishda xato:", error);
      toast.error("Mahsulot o'chirishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

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

  const getTimeRemaining = () => {
    if (order?.status !== "in_process" || !order?.start_time || !order?.estimated_completion_time) {
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
            <p className="text-muted-foreground">Iltimos, buyurtma tafsilotlari yuklanishini kuting.</p>
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
            <p className="text-muted-foreground mb-4">Buyurtma tafsilotlarini ko'rish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Buyurtma topilmadi</h1>
            <p className="text-muted-foreground mb-4">Siz qidirayotgan buyurtma mavjud emas.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga qaytish
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Permission checks after confirming order is not null
  const isOwner = user?.id === order.client.id;
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isManagerOrAdmin = isManager || isAdmin;
  const canEdit = isOwner && order.status === "client_approved";
  const canManage = isManagerOrAdmin && order.status !== "completed" && order.status !== "rejected";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Buyurtmalarga qaytish
          </Button>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{order.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Yaratilgan: {new Date(order.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Tayinlangan mahsulotlar</h3>
                      <ul className="list-disc pl-5">
                        {order.products.map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.product.name} (Miqdor: {item.quantity})
                            {isManagerOrAdmin && order.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-red-500"
                                onClick={() => handleRemoveProduct(item.product.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {order.estimated_price && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Taxminiy narx</h3>
                      <p>{order.estimated_price.toLocaleString("uz-UZ")} so‘m</p>
                    </div>
                  )}
                  {order.estimated_completion_time && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Taxminiy yakunlash vaqti</h3>
                      <p>{order.estimated_completion_time} soat</p>
                    </div>
                  )}
                  {isOwner && order.status === "in_process" && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Qolgan vaqt</h3>
                      <p>{getTimeRemaining() || "Hisoblanmoqda..."}</p>
                    </div>
                  )}
                  {order.rejection_reason && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-red-600 mb-2">Rad etish sababi</h3>
                      <p>{order.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Buyurtma tafsilotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Yaratilgan</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Mijoz</p>
                      <p className="text-sm text-muted-foreground">{order.client.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium">Aloqa email</p>
                    <p className="text-sm text-muted-foreground ml-2">{order.client.email}</p>
                  </div>
                  {order.manager && (
                    <>
                      <Separator />
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Menejer</p>
                          <p className="text-sm text-muted-foreground">{order.manager.username}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Amallar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {canEdit && (
                  <>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/orders/${id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Buyurtmani tahrirlash
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleDeleteOrder}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Buyurtmani o'chirish
                    </Button>
                  </>
                )}
                {canManage && (
                  <>
                    {order.status === "client_approved" && (
                      <Button
                        className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                        variant="outline"
                        onClick={handleStartProcessing}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Jarayonni boshlash
                      </Button>
                    )}
                    {order.status === "in_process" && (
                      <Button
                        className="w-full border-green-500 text-green-500 hover:bg-green-50"
                        variant="outline"
                        onClick={handleCompleteOrder}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Buyurtmani yakunlash
                      </Button>
                    )}
                    {order.status !== "completed" && order.status !== "rejected" && (
                      <>
                        <div className="space-y-2">
                          <Label>Mahsulot qo'shish</Label>
                          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                            <SelectTrigger>
                              <SelectValue placeholder="Mahsulot tanlang" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  {product.name} (Zaxira: {product.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="number"
                            min="1"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(e.target.value)}
                            placeholder="Miqdor"
                          />
                          <Button onClick={handleAddProduct} className="w-full">
                            Mahsulot qo'shish
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Rad etish sababi</Label>
                          <Input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Rad etish sababi"
                          />
                          <Button
                            className="w-full border-red-500 text-red-500 hover:bg-red-50"
                            variant="outline"
                            onClick={handleRejectOrder}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Buyurtmani rad etish
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
                {!canEdit && !canManage && (
                  <p className="text-sm text-muted-foreground text-center">
                    Ushbu buyurtma uchun hech qanday amallar mavjud emas.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
