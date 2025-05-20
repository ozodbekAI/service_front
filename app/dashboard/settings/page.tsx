"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Bell, Sun, Upload } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import toast from "react-hot-toast";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
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
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    systemAnnouncements: true,
    marketingEmails: false,
  });
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactView: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleAppearanceToggle = (setting: string) => {
    setAppearanceSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Profil yangilanmoqda...");

    try {
      // In a real app, this would be an API call to update the user profile
      // await updateUserProfile(profileForm);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Profil muvaffaqiyatli yangilandi", { id: loadingToast });
    } catch (error) {
      console.error("Profilni yangilashda xato:", error);
      toast.error("Profilni yangilashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", { id: loadingToast });
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
      // In a real app, this would be an API call to change the password
      // await changePassword(passwordForm);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Parol muvaffaqiyatli o'zgartirildi", { id: loadingToast });
    } catch (error) {
      console.error("Parolni o'zgartirishda xato:", error);
      toast.error("Parolni o'zgartirishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Bildirishnoma sozlamalari yangilanmoqda...");

    try {
      // In a real app, this would be an API call to update notification settings
      // await updateNotificationSettings(notificationSettings);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Bildirishnoma sozlamalari muvaffaqiyatli yangilandi", { id: loadingToast });
    } catch (error) {
      console.error("Bildirishnoma sozlamalarini yangilashda xato:", error);
      toast.error("Bildirishnoma sozlamalarini yangilashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading("Tashqi ko'rinish sozlamalari yangilanmoqda...");

    try {
      // In a real app, this would be an API call to update appearance settings
      // await updateAppearanceSettings(appearanceSettings);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Tashqi ko'rinish sozlamalari muvaffaqiyatli yangilandi", { id: loadingToast });
    } catch (error) {
      console.error("Tashqi ko'rinish sozlamalarini yangilashda xato:", error);
      toast.error("Tashqi ko'rinish sozlamalarini yangilashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
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
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Bildirishnomalar
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Sun className="mr-2 h-4 w-4" />
              Tashqi ko'rinish
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
                      <AvatarImage src="/placeholder.svg" alt={user.username} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Avatar o'zgartirish
                    </Button>
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
                        value={profileForm.phone}
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

          <TabsContent value="notifications">
            <Card>
              <form onSubmit={handleNotificationsSubmit}>
                <CardHeader>
                  <CardTitle>Bildirishnomalar</CardTitle>
                  <CardDescription>Bildirishnoma afzalliklarini boshqaring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Elektron pochta bildirishnomalari</Label>
                      <p className="text-sm text-muted-foreground">Elektron pochta orqali bildirishnomalar olish</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="orderUpdates">Buyurtma yangilanishlari</Label>
                      <p className="text-sm text-muted-foreground">Buyurtma holati o'zgarishlari haqida xabar olish</p>
                    </div>
                    <Switch
                      id="orderUpdates"
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={() => handleNotificationToggle("orderUpdates")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="systemAnnouncements">Tizim e'lonlari</Label>
                      <p className="text-sm text-muted-foreground">Muhim tizim e'lonlarini olish</p>
                    </div>
                    <Switch
                      id="systemAnnouncements"
                      checked={notificationSettings.systemAnnouncements}
                      onCheckedChange={() => handleNotificationToggle("systemAnnouncements")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing elektron pochtalari</Label>
                      <p className="text-sm text-muted-foreground">Reklama xatlari va takliflarni olish</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={() => handleNotificationToggle("marketingEmails")}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saqlanmoqda..." : "Afzalliklarni saqlash"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card>
              <form onSubmit={handleAppearanceSubmit}>
                <CardHeader>
                  <CardTitle>Tashqi ko'rinish</CardTitle>
                  <CardDescription>Interfeys afzalliklarini sozlang</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="darkMode">Qorong'i rejim</Label>
                      <p className="text-sm text-muted-foreground">Interfeys uchun qorong'i mavzudan foydalaning</p>
                    </div>
                    <Switch
                      id="darkMode"
                      checked={appearanceSettings.darkMode}
                      onCheckedChange={() => handleAppearanceToggle("darkMode")}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compactView">Ixcham ko'rinish</Label>
                      <p className="text-sm text-muted-foreground">Jadval va ro'yxatlar uchun ixcham tartibdan foydalaning</p>
                    </div>
                    <Switch
                      id="compactView"
                      checked={appearanceSettings.compactView}
                      onCheckedChange={() => handleAppearanceToggle("compactView")}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saqlanmoqda..." : "Afzalliklarni saqlash"}
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
