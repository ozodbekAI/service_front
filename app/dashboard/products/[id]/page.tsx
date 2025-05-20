"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchProduct, deleteProduct } from "@/lib/api";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  category_details?: {
    id: number;
    name: string;
    description?: string;
  } | null;
  images: { id: number; image: string }[];
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      const loadingToast = toast.loading("Mahsulot tafsilotlari yuklanmoqda...");
      try {
        const data = await fetchProduct(Number(productId));
        setProduct(data);
        toast.success("Mahsulot tafsilotlari muvaffaqiyatli yuklandi!", { id: loadingToast });
      } catch (error) {
        console.error("Mahsulotni yuklashda xato:", error);
        toast.error("Mahsulotni yuklashda xato yuz berdi. U mavjud emas bo'lishi mumkin.", {
          id: loadingToast,
        });
        router.push("/dashboard/products");
      } finally {
        setIsLoading(false);
      }
    };

    if (authLoading || !user || !productId) return;
    loadProduct();
  }, [user, productId, router, authLoading]);

  const handleDeleteProduct = async () => {
    if (confirm("Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?")) {
      const loadingToast = toast.loading("Mahsulot o'chirilmoqda...");
      try {
        await deleteProduct(Number(productId));
        toast.success("Mahsulot muvaffaqiyatli o'chirildi.", { id: loadingToast });
        router.push("/dashboard/products?refresh=true");
      } catch (error) {
        console.error("Mahsulotni o'chirishda xato:", error);
        toast.error("Mahsulotni o'chirishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      }
    }
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Zaxira yo'q</Badge>;
    } else if (quantity <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Kam zaxira</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 border-green-200">Zaxirada</Badge>;
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Yuklanmoqda...</h1>
            <p className="text-muted-foreground">Iltimos, mahsulot tafsilotlari yuklanishini kuting.</p>
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
            <p className="text-muted-foreground mb-4">Mahsulot tafsilotlarini ko'rish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Yuklanmoqda...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Mahsulot topilmadi</h1>
            <p className="text-muted-foreground mb-4">Siz qidirayotgan mahsulot mavjud emas.</p>
            <Button asChild>
              <Link href="/dashboard/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Mahsulotlarga qaytish
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isManagerOrAdmin = user.role === "admin" || user.role === "manager";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Mahsulotlarga qaytish
            </Link>
          </Button>
          {isManagerOrAdmin && (
            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="mr-2 h-4 w-4" />
              Mahsulotni o'chirish
            </Button>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Mahsulot tafsilotlari</h3>
              {getStockBadge(product.quantity)}
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Nomi:</span> {product.name}
              </p>
              <p>
                <span className="font-medium">Tavsif:</span>{" "}
                {product.description || "Tavsif berilmagan"}
              </p>
              <p>
                <span className="font-medium">Narxi:</span>{" "}
                {Number(product.price).toLocaleString("uz-UZ")} so‘m
              </p>
              <p>
                <span className="font-medium">Zaxira:</span> {product.quantity}
              </p>
              <p>
                <span className="font-medium">Kategoriya:</span>{" "}
                {product.category_details ? product.category_details.name : "Kategoriyasiz"}
              </p>
              <p>
                <span className="font-medium">Yaratilgan:</span>{" "}
                {new Date(product.created_at).toLocaleString("uz-UZ")}
              </p>
              <p>
                <span className="font-medium">Yangilangan:</span>{" "}
                {new Date(product.updated_at).toLocaleString("uz-UZ")}
              </p>
            </div>
            {product.images && product.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Rasmlar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.image}
                        alt={`${product.name} rasm ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                          Asosiy
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
