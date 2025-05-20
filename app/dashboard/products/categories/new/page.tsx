"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createProductCategory } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewCategoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Kategoriya yaratilmoqda...");

    try {
      if (!formData.name) {
        throw new Error("Kategoriya nomi talab qilinadi");
      }

      await createProductCategory({
        name: formData.name,
        description: formData.description,
      });

      toast.success("Kategoriya muvaffaqiyatli yaratildi", { id: loadingToast });
      router.push(`/dashboard/products?created=true`);
    } catch (error: any) {
      console.error("Kategoriya yaratishda xato:", error);
      toast.error(error.message || "Kategoriya yaratishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
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
            <p className="text-muted-foreground mb-4">Kategoriya yaratish uchun tizimga kiring.</p>
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
            <p className="text-muted-foreground mb-4">Faqat adminlar va menejerlar kategoriya yarata oladi.</p>
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
                <CardTitle>Yangi kategoriya qo'shish</CardTitle>
                <CardDescription>Yangi mahsulot kategoriyasini yaratish</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Kategoriya nomi</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Masalan, Aksessuarlar"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif (Ixtiyoriy)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Kategoriyani tasvirlang..."
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Kategoriya yaratilmoqda..." : "Kategoriya yaratish"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
