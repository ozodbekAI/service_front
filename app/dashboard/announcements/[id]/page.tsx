"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, User, Edit, Trash2, Check, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAnnouncement,
  acceptAnnouncement,
  rejectAnnouncement,
  clientApproveAnnouncement,
  clientRejectAnnouncement,
  deleteAnnouncement,
  fetchProducts,
  uploadAnnouncementImages,
} from "@/lib/api";

interface Announcement {
  id: number;
  title: string;
  description: string;
  status: "pending" | "accepted" | "in_process" | "completed" | "rejected";
  created_at: string;
  estimated_price?: number;
  estimated_completion_time?: number;
  rejection_reason?: string;
  client: {
    id: number;
    username: string;
    email: string;
  };
  images?: { id: number; image: string }[];
}

interface Product {
  id: number;
  name: string;
  quantity: number;
}

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [acceptData, setAcceptData] = useState({
    estimated_completion_time: "",
    estimated_price: "",
    products: [] as { product_id: number; quantity: number }[],
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [clientRejectionReason, setClientRejectionReason] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const loadAnnouncement = async () => {
      setIsLoading(true);
      const loadingToast = toast.loading("E'lon tafsilotlari yuklanmoqda...");
      try {
        const data = await fetchAnnouncement(Number(id));
        setAnnouncement(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].image);
        }
        toast.success("E'lon tafsilotlari muvaffaqiyatli yuklandi!", { id: loadingToast });
      } catch (error) {
        console.error("E'lonni yuklashda xato:", error);
        toast.error("E'lonni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
        setAnnouncement(null);
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
    loadAnnouncement();
    if (user.role === "admin" || user.role === "manager") {
      loadProducts();
    }
  }, [id, user, authLoading]);

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error("Iltimos, yuklash uchun rasm tanlang.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    if (!id) {
      toast.error("E'lon ID topilmadi.");
      return;
    }
    formData.append("announcement_id", id.toString());

    const loadingToast = toast.loading("Rasm yuklanmoqda...");
    try {
      await uploadAnnouncementImages(formData);
      const updatedAnnouncement = await fetchAnnouncement(Number(id));
      setAnnouncement(updatedAnnouncement);
      setImageFile(null);
      if (updatedAnnouncement.images && updatedAnnouncement.images.length > 0) {
        setSelectedImage(updatedAnnouncement.images[updatedAnnouncement.images.length - 1].image);
      }
      toast.success("Rasm muvaffaqiyatli yuklandi!", { id: loadingToast });
    } catch (error: any) {
      console.error("Rasm yuklashda xato:", error);
      toast.error(error.message || "Rasm yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleAcceptAnnouncement = async () => {
    if (!acceptData.estimated_completion_time || !acceptData.estimated_price) {
      toast.error("Iltimos, taxminiy vaqt va narxni kiriting.");
      return;
    }

    const loadingToast = toast.loading("E'lon qabul qilinmoqda...");
    try {
      const updatedAnnouncement = await acceptAnnouncement(Number(id), {
        estimated_completion_time: Number(acceptData.estimated_completion_time),
        estimated_price: Number(acceptData.estimated_price),
        products: acceptData.products,
      });
      setAnnouncement(updatedAnnouncement);
      toast.success("E'lon muvaffaqiyatli qabul qilindi!", { id: loadingToast });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("E'lonni qabul qilishda xato:", error);
      toast.error(error.message || "E'lonni qabul qilishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleRejectAnnouncement = async () => {
    if (!rejectionReason) {
      toast.error("Iltimos, rad etish sababini kiriting.");
      return;
    }

    const loadingToast = toast.loading("E'lon rad etilmoqda...");
    try {
      const updatedAnnouncement = await rejectAnnouncement(Number(id), rejectionReason);
      setAnnouncement(updatedAnnouncement);
      toast.success("E'lon muvaffaqiyatli rad etildi!", { id: loadingToast });
    } catch (error) {
      console.error("E'lonni rad etishda xato:", error);
      toast.error("E'lonni rad etishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleClientApprove = async () => {
    const loadingToast = toast.loading("E'lon tasdiqlanmoqda...");
    try {
      const updatedAnnouncement = await clientApproveAnnouncement(Number(id));
      setAnnouncement(updatedAnnouncement);
      toast.success("E'lon muvaffaqiyatli tasdiqlandi! Buyurtma yaratildi.", { id: loadingToast });
      router.push("/dashboard/orders");
    } catch (error: any) {
      console.error("E'lonni tasdiqlashda xato:", error);
      toast.error(
        error.response?.data?.detail || "E'lonni tasdiqlashda xato yuz berdi. Iltimos, qayta urinib ko'ring.",
        { id: loadingToast }
      );
    }
  };

  const handleClientReject = async () => {
    if (!clientRejectionReason) {
      toast.error("Iltimos, rad etish sababini kiriting.");
      return;
    }

    const loadingToast = toast.loading("E'lon rad etilmoqda...");
    try {
      const updatedAnnouncement = await clientRejectAnnouncement(Number(id), clientRejectionReason);
      setAnnouncement(updatedAnnouncement);
      setClientRejectionReason("");
      toast.success("E'lon muvaffaqiyatli rad etildi!", { id: loadingToast });
    } catch (error) {
      console.error("E'lonni rad etishda xato:", error);
      toast.error("E'lonni rad etishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const handleDeleteAnnouncement = async () => {
    if (confirm("Haqiqatan ham ushbu e'lonni o'chirmoqchimisiz?")) {
      const loadingToast = toast.loading("E'lon o'chirilmoqda...");
      try {
        await deleteAnnouncement(Number(id));
        toast.success("E'lon muvaffaqiyatli o'chirildi!", { id: loadingToast });
        router.push("/dashboard/announcements");
      } catch (error) {
        console.error("E'lonni o'chirishda xato:", error);
        toast.error("E'lonni o'chirishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      }
    }
  };

  const addProduct = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === Number(selectedProduct));
    if (product) {
      setAcceptData((prev) => ({
        ...prev,
        products: [...prev.products, { product_id: product.id, quantity: 1 }],
      }));
      setSelectedProduct("");
    }
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    setAcceptData((prev) => {
      const newProducts = [...prev.products];
      newProducts[index].quantity = quantity;
      return { ...prev, products: newProducts };
    });
  };

  const removeProduct = (index: number) => {
    setAcceptData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Kutilmoqda</Badge>;
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Qabul qilingan</Badge>;
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

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Yuklanmoqda...</h1>
            <p className="text-muted-foreground">Iltimos, e'lon tafsilotlari yuklanishini kuting.</p>
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
            <p className="text-muted-foreground mb-4">E'lon tafsilotlarini ko'rish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!announcement) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">E'lon topilmadi</h1>
            <p className="text-muted-foreground mb-4">Siz qidirayotgan e'lon mavjud emas.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga qaytish
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Define permissions only if announcement is not null
  const isOwner = user?.id === announcement?.client?.id;
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager" && !isAdmin;
  const isManagerOrAdmin = isAdmin || isManager;
  const canEdit = isOwner && announcement.status === "pending";
  const canAcceptOrReject = isManagerOrAdmin && announcement.status === "pending";
  const canClientApproveOrReject = isOwner && announcement.status === "accepted";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            E'lonlarga qaytish
          </Button>
          {getStatusBadge(announcement.status)}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Joylashtirilgan: {new Date(announcement.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcement.images && announcement.images.length > 0 ? (
                    <div className="space-y-2">
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        <img
                          src={selectedImage || announcement.images[0].image}
                          alt={announcement.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {announcement.images.map((image) => (
                          <div
                            key={image.id}
                            className={`w-full aspect-square rounded-md overflow-hidden cursor-pointer ${
                              selectedImage === image.image ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedImage(image.image)}
                          >
                            <img
                              src={image.image}
                              alt={`Rasm ${image.id}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      Ushbu e'lon uchun rasmlar mavjud emas.
                    </div>
                  )}
                  {canEdit && (
                    <div className="space-y-2">
                      <Label>Rasm yuklash</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        />
                        <Button
                          onClick={handleImageUpload}
                          disabled={!imageFile}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Yuklash
                        </Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tavsif</h3>
                    <p className="whitespace-pre-line">{announcement.description}</p>
                  </div>
                  {announcement.estimated_price && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Taxminiy narx</h3>
                      <p>{announcement.estimated_price.toLocaleString("uz-UZ")} so‘m</p>
                    </div>
                  )}
                  {announcement.estimated_completion_time && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Taxminiy yakunlash vaqti</h3>
                      <p>{announcement.estimated_completion_time} soat</p>
                    </div>
                  )}
                  {announcement.rejection_reason && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-red-600 mb-2">Rad etish sababi</h3>
                      <p>{announcement.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>E'lon tafsilotlari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Joylashtirilgan</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleString("uz-UZ")}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Joylashtiruvchi</p>
                      <p className="text-sm text-muted-foreground">{announcement.client?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium">Aloqa email</p>
                    <p className="text-sm text-muted-foreground ml-2">{announcement.client?.email}</p>
                  </div>
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
                      onClick={() => router.push(`/dashboard/announcements/${id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      E'lonni tahrirlash
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleDeleteAnnouncement}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      E'lonni o'chirish
                    </Button>
                  </>
                )}
                {canAcceptOrReject && (
                  <>
                    <div className="space-y-2">
                      <Label>Taxminiy yakunlash vaqti (soat)</Label>
                      <Input
                        type="number"
                        value={acceptData.estimated_completion_time}
                        onChange={(e) =>
                          setAcceptData({ ...acceptData, estimated_completion_time: e.target.value })
                        }
                        placeholder="24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Taxminiy narx (so‘m)</Label>
                      <Input
                        type="number"
                        value={acceptData.estimated_price}
                        onChange={(e) =>
                          setAcceptData({ ...acceptData, estimated_price: e.target.value })
                        }
                        placeholder="100000"
                      />
                    </div>
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
                      <Button onClick={addProduct} className="w-full mt-2">
                        Mahsulot qo'shish
                      </Button>
                    </div>
                    {acceptData.products.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Tanlangan mahsulotlar</h4>
                        {acceptData.products.map((prod, index) => {
                          const product = products.find((p) => p.id === prod.product_id);
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <span>{product?.name || "Noma'lum mahsulot"}</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={prod.quantity}
                                  onChange={(e) => updateProductQuantity(index, Number(e.target.value))}
                                  className="w-20"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeProduct(index)}
                                  className="text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <Button
                      className="w-full border-green-500 text-green-500 hover:bg-green-50"
                      variant="outline"
                      onClick={handleAcceptAnnouncement}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Qabul qilish
                    </Button>
                    <div className="space-y-2">
                      <Label>Rad etish sababi</Label>
                      <Input
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rad etish sababi"
                      />
                    </div>
                    <Button
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                      variant="outline"
                      onClick={handleRejectAnnouncement}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rad etish
                    </Button>
                  </>
                )}
                {canClientApproveOrReject && (
                  <>
                    <Button
                      className="w-full border-green-500 text-green-500 hover:bg-green-50"
                      variant="outline"
                      onClick={handleClientApprove}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Buyurtmani tasdiqlash
                    </Button>
                    <div className="space-y-2">
                      <Label>Rad etish sababi</Label>
                      <Input
                        value={clientRejectionReason}
                        onChange={(e) => setClientRejectionReason(e.target.value)}
                        placeholder="Rad etish sababi"
                      />
                    </div>
                    <Button
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                      variant="outline"
                      onClick={handleClientReject}
                      disabled={!clientRejectionReason}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Buyurtmani rad etish
                    </Button>
                  </>
                )}
                {!canEdit && !canAcceptOrReject && !canClientApproveOrReject && (
                  <p className="text-sm text-muted-foreground text-center">
                    Ushbu e'lon uchun hech qanday amallar mavjud emas.
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
