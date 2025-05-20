"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createOrder, uploadOrderImages } from "@/lib/api";
import Link from "next/link";

interface OrderFormData {
  title: string;
  description: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<OrderFormData>({
    title: "",
    description: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors && errors[name]) {
      setErrors((prev) => ({ ...prev!, [name]: [] }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    const loadingToast = toast.loading("Buyurtma yaratilmoqda...");
    try {
      if (!formData.title || !formData.description) {
        throw new Error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      }

      const orderData = {
        title: formData.title,
        description: formData.description,
      };
      const newOrder = await createOrder(orderData);

      if (images.length > 0) {
        const formDataImages = new FormData();
        images.forEach((image) => {
          formDataImages.append("image", image);
          formDataImages.append("order_id", newOrder.id.toString());
        });
        await uploadOrderImages(formDataImages);
      }

      toast.success("Buyurtma muvaffaqiyatli yaratildi!", { id: loadingToast });
      router.push(`/dashboard/orders?refresh=true`);
    } catch (error: any) {
      console.error("Buyurtma yaratishda xato:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        toast.error("Buyurtma yaratishda xato yuz berdi. Maydonlarni tekshiring.", { id: loadingToast });
      } else {
        setErrors({ general: [error.message || "Buyurtma yaratishda xato yuz berdi. Iltimos, qayta urinib ko'ring."] });
        toast.error(error.message || "Buyurtma yaratishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Yuklanmoqda...</h1>
            <p className="text-muted-foreground">Iltimos, sahifa yuklanishini kuting.</p>
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
            <p className="text-muted-foreground mb-4">Buyurtma yaratish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (user.role !== "client" && user.role !== "manager") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
            <p className="text-muted-foreground mb-4">Faqat mijozlar va menejerlar buyurtma yarata oladi.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga qaytish
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Buyurtmalarga qaytish
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Yangi buyurtma yaratish</CardTitle>
                <p className="text-muted-foreground">Yangi xizmat buyurtmasini yuboring</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors?.general && (
                  <p className="text-red-500 mb-4">{errors.general.join(", ")}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Buyurtma sarlavhasi</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Masalan, Noutbukni ta'mirlash so'rovi"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                  {errors?.title && (
                    <p className="text-red-500 text-sm">{errors.title.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Buyurtmangizni batafsil tasvirlang..."
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                  {errors?.description && (
                    <p className="text-red-500 text-sm">{errors.description.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Rasmlar (Ixtiyoriy)</Label>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Yuklangan rasm ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Rasmlarni yuklash uchun bosing</span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Buyurtma yaratilmoqda..." : "Buyurtma yaratish"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
