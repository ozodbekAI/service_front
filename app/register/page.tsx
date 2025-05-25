"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Monitor, AlertCircle, Briefcase } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    is_legal: false,
    companyName: "",
    password: "",
    confirmPassword: "",
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;

  if (name === "is_legal") {
    // `select` elementidan kelayotgan qiymatni boolean ga aylantiramiz
    setFormData((prev) => ({
      ...prev,
      is_legal: value === "legal", // "legal" bo'lsa true, aks holda false
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAgreed) {
      setError("Ro‘yxatdan o‘tish uchun foydalanish shartlariga rozilik berishingiz kerak.");
      toast.error("Foydalanish shartlariga rozilik berishingiz kerak!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Parollar mos kelmadi");
      toast.error("Parollar mos kelmadi!");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        is_legal: formData.is_legal,
        companyName: formData.is_legal ? formData.companyName : undefined,
        password: formData.password,
      });
      toast.success("Hisob muvaffaqiyatli yaratildi!");
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Ro‘yxatdan o‘tishda xato yuz berdi. Iltimos, qayta urinib ko‘ring.");
      toast.error("Ro‘yxatdan o‘tishda xato yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Monitor className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KompXizmat</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Hisob yaratish</CardTitle>
            <CardDescription>Yangi hisob yaratish uchun ma'lumotlaringizni kiriting</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="fullname">F.I.SH</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Elektron pochta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+998901234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_legal">Mijoz turi</Label>
                <select
                  id="is_legal"
                  name="is_legal"
                  value={formData.is_legal ? "legal" : "individual"}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="individual">Jismoniy shaxs</option>
                  <option value="legal">Yuridik shaxs</option>
                </select>
              </div>
              {formData.is_legal && (
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary" /> Kompaniya nomi
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Parol</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Parolni tasdiqlash</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree"
                  checked={isAgreed}
                  onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
                />
                <Label htmlFor="agree" className="text-sm">
                  <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                    <DialogTrigger asChild>
                      <span className="text-primary hover:underline cursor-pointer">Foydalanish shartlari</span>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Foydalanish shartlari</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[60vh] overflow-y-auto">
                        <p className="text-sm text-muted-foreground">
                          Ushbu saytdan foydalanish orqali siz quyidagi shartlarga rozilik bildirasiz:
                        </p>
                        <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                          <li>Shaxsiy ma'lumotlaringizni faqat sayt xizmatlarini taqdim etish uchun ishlatamiz.</li>
                          <li>Ma'lumotlaringiz uchinchi shaxslarga berilmaydi, qonun talab qilgan holatlar bundan mustasno.</li>
                          <li>Sayt xizmatlaridan noqonuniy maqsadlarda foydalanish taqiqlanadi.</li>
                          <li>Hisobingiz xavfsizligi uchun parolingizni maxfiy saqlashingiz kerak.</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mt-2">
                          To‘liq shartlar bilan tanishish uchun administrator bilan bog‘laning.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>{" "}
                  va ma'lumotlarni saqlashga roziman
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading || !isAgreed}>
                {isLoading ? "Hisob yaratilmoqda..." : "Ro‘yxatdan o‘tish"}
              </Button>
              <div className="text-center text-sm">
                Hisobingiz bormi?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Tizimga kirish
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        <Toaster />
      </div>
    </div>
  );
}