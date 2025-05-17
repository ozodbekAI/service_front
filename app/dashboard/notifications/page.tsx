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
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_id?: number;
  estimated_price?: number;
  estimated_completion_time?: number;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load notifications. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark notification as read.",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read.",
      });
    }
  };

  const handleApproveAnnouncement = async (notificationId: number, announcementId?: number) => {
    if (!announcementId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid announcement ID.",
      });
      return;
    }

    try {
      await fetchWithAuth(`/application/announcements/${announcementId}/client_approve/`, {
        method: "POST",
      });
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      toast({
        title: "Success",
        description: "Announcement approved. Order created.",
      });
      router.push("/dashboard/orders");
    } catch (error: any) {
      console.error("Failed to approve announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.detail || "Failed to approve announcement. Please try again.",
      });
    }
  };

  const handleRejectAnnouncement = async (notificationId: number, announcementId?: number) => {
    if (!announcementId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid announcement ID.",
      });
      return;
    }

    const reason = rejectionReason[notificationId] || "";
    if (!reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason.",
      });
      return;
    }

    try {
      await fetchWithAuth(`/application/announcements/${announcementId}/client_reject/`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: reason }),
      });
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
      setRejectionReason((prev) => ({ ...prev, [notificationId]: "" }));
      toast({
        title: "Success",
        description: "Announcement rejected.",
      });
    } catch (error) {
      console.error("Failed to reject announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject announcement. Please try again.",
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

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with system alerts and messages</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Notifications</CardTitle>
              {unreadCount > 0 && <Badge className="bg-primary">{unreadCount} unread</Badge>}
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
              <div className="text-center py-6 text-muted-foreground">No notifications found.</div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      !notification.is_read ? "bg-muted/50 border-primary/20" : ""
                    }`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      {notification.type === "announcement_accepted" && !notification.is_read && (
                        <div className="space-y-2">
                          {notification.estimated_price && (
                            <p className="text-sm">
                              <strong>Estimated Price:</strong> {notification.estimated_price.toLocaleString()} сум
                            </p>
                          )}
                          {notification.estimated_completion_time && (
                            <p className="text-sm">
                              <strong>Estimated Completion Time:</strong> {notification.estimated_completion_time} hours
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveAnnouncement(notification.id, notification.related_id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
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
                              Reject
                            </Button>
                          </div>
                          <Input
                            placeholder="Rejection reason (required for rejection)"
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
                    {!notification.is_read && notification.type !== "announcement_accepted" && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                        Mark as Read
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