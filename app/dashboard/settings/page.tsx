"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Lock } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import Link from "next/link";
import { uploadProfileImage } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://pc.ustaxona.bazarchi.software/api/v1";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, setUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // Tokenni yangilash funksiyasi
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("Refresh token topilmadi. Iltimos, qayta kiring.");
    }

    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Tokenni yangilashda xato yuz berdi.");
    }

    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    return data.access;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Profil yangilanmoqda...");

    try {
      let token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Tizimga qayta kiring, token topilmadi.");
      }

      let updateResponse = await fetch(`${API_BASE_URL}/user/update_profile/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: profileForm.username,
          email: profileForm.email,
          phone: profileForm.phone,
        }),
      });

      if (updateResponse.status === 401) {
        try {
          token = await refreshAccessToken();
          updateResponse = await fetch(`${API_BASE_URL}/user/update_profile/`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              username: profileForm.username,
              email: profileForm.email,
              phone: profileForm.phone,
            }),
          });
        } catch (refreshError) {
          toast.error("Sessiya tugadi. Iltimos, qayta kiring.", { id: loadingToast });
          router.push("/login");
          return;
        }
      }

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.detail || "Profilni yangilashda xato yuz berdi.");
      }

      let meResponse = await fetch(`${API_BASE_URL}/user/me/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (meResponse.status === 401) {
        try {
          token = await refreshAccessToken();
          meResponse = await fetch(`${API_BASE_URL}/user/me/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (refreshError) {
          toast.error("Sessiya tugadi. Iltimos, qayta kiring.", { id: loadingToast });
          router.push("/login");
          return;
        }
      }

      if (!meResponse.ok) {
        const errorData = await meResponse.json();
        throw new Error(errorData.detail || "Foydalanuvchi ma'lumotlarini olishda xato yuz berdi.");
      }

      const updatedUser = await meResponse.json();
      setUser({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        is_legal: updatedUser.is_legal,
        profile_image: updatedUser.profile_image,
      });

      setProfileForm({
        username: updatedUser.username || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
      });

      toast.success("Profil muvaffaqiyatli yangilandi", { id: loadingToast });
    } catch (error) {
      console.error("Profilni yangilashda xato:", error);
      toast.error(
        error instanceof Error ? error.message : "Profilni yangilashda xato yuz berdi.",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Parol o'zgartirilmoqda...");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Yangi parollar mos kelmadi", { id: loadingToast });
      setIsSubmitting(false);
      return;
    }

    try {
      let token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Tizimga qayta kiring, token topilmadi.");
      }

      const response = await fetch(`${API_BASE_URL}/user/change_password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      if (response.status === 401) {
        try {
          token = await refreshAccessToken();
          const retryResponse = await fetch(`${API_BASE_URL}/user/change_password/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              current_password: passwordForm.currentPassword,
              new_password: passwordForm.newPassword,
            }),
          });

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json();
            throw new Error(errorData.error || "Parolni o'zgartirishda xato yuz berdi.");
          }
        } catch (refreshError) {
          toast.error("Sessiya tugadi. Iltimos, qayta kiring.", { id: loadingToast });
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
          router.push("/login");
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Parolni o'zgartirishda xato yuz berdi.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      const data = await response.json();
      document.cookie = `refresh=${data.refresh}; max-age=${60 * 60 * 24 * 365}; path=/`;
      document.cookie = `access=${data.access}; max-age=${60 * 60 * 24 * 365}; path=/`;
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      toast.success("Parol muvaffaqiyatli o'zgartirildi.", { id: loadingToast });
    } catch (error) {
      console.error("Parolni o'zgartirishda xato:", error);
      toast.error(
        error instanceof Error ? error.message : "Parolni o'zgartirishda xato yuz berdi.",
        { id: loadingToast }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // File size and type validation
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Rasm hajmi 5MB dan katta bo'lmasligi kerak.");
            return;
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Faqat JPEG, PNG yoki GIF formatidagi rasmlar qabul qilinadi.");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading("Rasm yuklanmoqda...");

        try {
            const formData = new FormData();
            formData.append("profile_image", file);

            const response = await uploadProfileImage(formData);
            // ...
        } catch (error) {
            console.error("Rasm yuklashda xato:", error);
            toast.error(
                error instanceof Error ? error.message : "Rasm yuklashda xato yuz berdi.",
                { id: loadingToast }
            );
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    }
};

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Yuklanmoqda...</h1>
            <p className="text-muted-foreground">Iltimos, sozlamalar yuklanishini kuting.</p>
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
            <p className="text-muted-foreground mb-4">Sozlamalarni ko'rish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const initials = user.username ? user.username.substring(0, 2).toUpperCase() : "F";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
          <p className="text-muted-foreground">Hisobingiz sozlamalari va afzalliklarini boshqaring</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="password">
              <Lock className="mr-2 h-4 w-4" />
              Parol
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <form onSubmit={handleProfileSubmit}>
                <CardHeader>
                  <CardTitle>Profil</CardTitle>
                  <CardDescription>Shaxsiy ma'lumotlaringizni boshqaring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center space-y-2">
                      <Label htmlFor="profileImage">Yangi profil rasmini tanlang</Label>
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="max-w-xs"
                        disabled={isUploading}
                      />
                      {isUploading && <p className="text-sm text-muted-foreground">Rasm yuklanmoqda...</p>}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Foydalanuvchi nomi</Label>
                      <Input
                        id="username"
                        name="username"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Elektron pochta</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={profileForm.username}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <form onSubmit={handlePasswordSubmit}>
                <CardHeader>
                  <CardTitle>Parol</CardTitle>
                  <CardDescription>Parolingizni o'zgartiring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Joriy parol</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Yangi parol</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Yangi parolni tasdiqlash</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "O'zgartirilmoqda..." : "Parolni o'zgartirish"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
