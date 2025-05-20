"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Package, Clock, Check, X } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, fetchWithAuth } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  related_id?: number;
  estimated_price?: number;
  estimated_completion_time?: number;
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      const loadingToast = toast.loading("Bildirishnomalar yuklanmoqda...");
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        toast.success("Bildirishnomalar muvaffaqiyatli yuklandi!", { id: loadingToast });
      } catch (error) {
        console.error("Bildirishnomalarni yuklashda xato:", error);
        toast.error("Bildirishnomalarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
          id: loadingToast,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (authLoading || !user) return;
    loadNotifications();
  }, [user, authLoading]);

  const handleMarkAsRead = async (id: number) => {
    const loadingToast = toast.loading("Bildirishnoma o'qilgan deb belgilandi...");
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      toast.success("Bildirishnoma muvaffaqiyatli o'qilgan deb belgilandi!", { id: loadingToast });
    } catch (error) {
      console.error("Bildirishnomani o'qilgan deb belgilashda xato:", error);
      toast.error("Bildirishnomani o'qilgan deb belgilashda xato yuz berdi.", { id: loadingToast });
    }
  };

  const handleMarkAllAsRead = async () => {
    const loadingToast = toast.loading("Barcha bildirishnomalar o'qilgan deb belgilandi...");
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
      toast.success("Barcha bildirishnomalar muvaffaqiyatli o'qilgan deb belgilandi!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Barcha bildirishnomalarni o'qilgan deb belgilashda xato:", error);
      toast.error("Barcha bildirishnomalarni o'qilgan deb belgilashda xato yuz berdi.", {
        id: loadingToast,
      });
    }
  };

  const handleApproveAnnouncement = async (notificationId: number, announcementId?: number) => {
    if (!announcementId) {
      toast.error("Noto'g'ri e'lon ID.");
      return;
    }

    const loadingToast = toast.loading("E'lon tasdiqlanmoqda...");
    try {
      await fetchWithAuth(`/application/announcements/${announcementId}/client_approve/`, {
        method: "POST",
      });
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      toast.success("E'lon tasdiqlandi. Buyurtma yaratildi.", { id: loadingToast });
      router.push("/dashboard/orders");
    } catch (error: any) {
      console.error("E'lonni tasdiqlashda xato:", error);
      toast.error(
        error.response?.data?.detail || "E'lonni tasdiqlashda xato yuz berdi. Iltimos, qayta urinib ko'ring.",
        { id: loadingToast }
      );
    }
  };

  const handleRejectAnnouncement = async (notificationId: number, announcementId?: number) => {
    if (!announcementId) {
      toast.error("Noto'g'ri e'lon ID.");
      return;
    }

    const reason = rejectionReason[notificationId] || "";
    if (!reason) {
      toast.error("Iltimos, rad etish sababini kiriting.");
      return;
    }

    const loadingToast = toast.loading("E'lon rad etilmoqda...");
    try {
      await fetchWithAuth(`/application/announcements/${announcementId}/client_reject/`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: reason }),
      });
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setRejectionReason((prev) => ({ ...prev, [notificationId]: "" }));
      toast.success("E'lon rad etildi.", { id: loadingToast });
    } catch (error) {
      console.error("E'lonni rad etishda xato:", error);
      toast.error("E'lonni rad etishda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "announcement_accepted":
      case "order_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "announcement_rejected":
      case "order_rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "low_stock":
        return <Package className="h-5 w-5 text-yellow-500" />;
      case "client_approved":
      case "order_in_process":
      case "other":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="text-center py-10">
            <h1 className="text-2xl font-bold mb-2">Yuklanmoqda...</h1>
            <p className="text-muted-foreground">Iltimos, bildirishnomalar yuklanishini kuting.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
              <p className="text-muted-foreground mb-4">Bildirishnomalarni ko'rish uchun tizimga kiring.</p>
              <Button asChild>
                <Link href="/login">Tizimga kirish</Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Bildirishnomalar</h1>
            <p className="text-muted-foreground">Tizim xabarlari va ogohlantirishlari bilan yangilangan bo'ling</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Barchasini o'qilgan deb belgilash
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Barcha bildirishnomalar</CardTitle>
              {unreadCount > 0 && <Badge className="bg-primary">{unreadCount} o'qilmagan</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">Hech qanday bildirishnoma topilmadi.</div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      !notification.read ? "bg-muted/50 border-primary/20" : ""
                    }`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString("uz-UZ")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {notification.type === "announcement_accepted" && !notification.read && (
                        <div className="space-y-2">
                          {notification.estimated_price && (
                            <p className="text-sm">
                              <strong>Taxminiy narx:</strong>{" "}
                              {notification.estimated_price.toLocaleString("uz-UZ")} so‘m
                            </p>
                          )}
                          {notification.estimated_completion_time && (
                            <p className="text-sm">
                              <strong>Taxminiy yakunlash vaqti:</strong>{" "}
                              {notification.estimated_completion_time} soat
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveAnnouncement(notification.id, notification.related_id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Tasdiqlash
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (rejectionReason[notification.id]) {
                                  handleRejectAnnouncement(notification.id, notification.related_id);
                                }
                              }}
                              disabled={!rejectionReason[notification.id]}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Rad etish
                            </Button>
                          </div>
                          <Input
                            placeholder="Rad etish sababi (rad etish uchun majburiy)"
                            value={rejectionReason[notification.id] || ""}
                            onChange={(e) =>
                              setRejectionReason((prev) => ({
                                ...prev,
                                [notification.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                    {!notification.read && notification.type !== "announcement_accepted" && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        O'qilgan deb belgilash
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
