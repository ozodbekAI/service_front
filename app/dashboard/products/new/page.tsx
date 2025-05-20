"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createProduct, fetchProductCategories, uploadProductImage } from "@/lib/api";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      const loadingToast = toast.loading("Kategoriyalar yuklanmoqda...");
      try {
        const data = await fetchProductCategories();
        setCategories(data);
        toast.success("Kategoriyalar muvaffaqiyatli yuklandi!", { id: loadingToast });
      } catch (error) {
        console.error("Kategoriyalarni yuklashda xato:", error);
        toast.error("Kategoriyalarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (authLoading || !user || (user.role !== "admin" && user.role !== "manager")) return;
    loadCategories();
  }, [user, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const loadingToast = toast.loading("Mahsulot yaratilmoqda...");

    try {
      if (!formData.name || !formData.price || !formData.quantity || !formData.category) {
        throw new Error("Iltimos, barcha majburiy maydonlarni to'ldiring");
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        quantity: Number.parseInt(formData.quantity),
        category: Number.parseInt(formData.category),
      };

      const response = await createProduct(productData);

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageFormData = new FormData();
          imageFormData.append("product", response.id.toString());
          imageFormData.append("image", images[i]);
          imageFormData.append("is_main", i === 0 ? "true" : "false");
          await uploadProductImage(imageFormData);
        }
        toast.success("Mahsulot rasmlar bilan muvaffaqiyatli yaratildi", { id: loadingToast });
      } else {
        toast.success("Mahsulot muvaffaqiyatli yaratildi", { id: loadingToast });
      }

      router.push(`/dashboard/products?created=true`);
    } catch (error: any) {
      console.error("Mahsulot yaratishda xato:", error);
      toast.error(error.message || "Mahsulot yaratishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
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
            <p className="text-muted-foreground mb-4">Mahsulot yaratish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (user.role !== "admin" && user.role !== "manager") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
            <p className="text-muted-foreground mb-4">Faqat adminlar va menejerlar mahsulot yarata oladi.</p>
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
            Mahsulotlarga qaytish
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Yangi mahsulot qo'shish</CardTitle>
                <CardDescription>Inventaringizga yangi mahsulot yarating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Mahsulot nomi</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Masalan, SSD 500GB"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Mahsulotni tasvirlang..."
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Narxi</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Miqdori</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category">Kategoriya</Label>
                    <Link href="/dashboard/products/categories/new">
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Yangi kategoriya qo'shish
                      </Button>
                    </Link>
                  </div>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategoriyani tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mahsulot rasmlari</Label>
                  <div className="border rounded-md p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Yuklash ${index + 1}`}
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
                          {index === 0 && (
                            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-1 rounded">
                              Asosiy
                            </span>
                          )}
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
                        <span className="text-xs text-muted-foreground">Birinchi rasm asosiy rasm bo'ladi</span>
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
                <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Mahsulot yaratilmoqda..." : "Mahsulot yaratish"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
