"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowUpDown, Calendar, User } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchManagedAnnouncements } from "@/lib/api";

interface Announcement {
  id: number;
  title: string;
  description: string;
  status: "pending" | "accepted" | "in_progress" | "rejected" | "completed";
  created_at: string;
  client: {
    id: number;
    username: string;
  };
}

export default function ManagedAnnouncementsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Boshqarilgan e'lonlar yuklanmoqda...");
    try {
      const data = await fetchManagedAnnouncements();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
      toast.success("Boshqarilgan e'lonlar muvaffaqiyatli yuklandi!", { id: loadingToast });
    } catch (error) {
      console.error("Boshqarilgan e'lonlarni yuklashda xato:", error);
      toast.error("Boshqarilgan e'lonlarni yuklashda xato yuz berdi. Iltimos, qayta urinib ko'ring.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || !isManagerOrAdmin) return;
    loadAnnouncements();
  }, [user, isManagerOrAdmin, authLoading]);

  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh") === "true";
    if (shouldRefresh && user && isManagerOrAdmin) {
      loadAnnouncements();
      router.replace("/dashboard/announcements/accepted");
    }
  }, [searchParams, router, user, isManagerOrAdmin]);

  useEffect(() => {
    let result = [...announcements];
    if (statusFilter !== "all") {
      result = result.filter((announcement) => announcement.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(query) ||
          announcement.description.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortOrder === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return 0;
    });
    setFilteredAnnouncements(result);
  }, [announcements, statusFilter, searchQuery, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Kutilmoqda</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Qabul qilingan</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Jarayonda</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rad etilgan</Badge>;
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Yakunlangan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">Yuklanmoqda...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
            <p className="text-muted-foreground mb-4">Boshqarilgan e'lonlarni ko'rish uchun tizimga kiring.</p>
            <Button asChild>
              <Link href="/login">Tizimga kirish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isManagerOrAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Ruxsat yo'q</h1>
            <p className="text-muted-foreground mb-4">
              Faqat adminlar va menejerlar boshqarilgan e'lonlarni ko'ra oladi.
            </p>
            <Button asChild>
              <Link href="/dashboard/announcements">E'lonlarga qaytish</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Boshqarilgan e'lonlar</h1>
            <p className="text-muted-foreground">Siz qabul qilgan yoki boshqargan barcha e'lonlarni ko'rib chiqing</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/announcements">Barcha e'lonlarga qaytish</Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="E'lonlarni qidirish..."
              className="pl-10 rounded-lg border border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Holati" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha holatlar</SelectItem>
                <SelectItem value="pending">Kutilmoqda</SelectItem>
                <SelectItem value="accepted">Qabul qilingan</SelectItem>
                <SelectItem value="in_progress">Jarayonda</SelectItem>
                <SelectItem value="rejected">Rad etilgan</SelectItem>
                <SelectItem value="completed">Yakunlangan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Saralash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Avval yangilari</SelectItem>
                <SelectItem value="oldest">Avval eskilar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sizning boshqarilgan e'lonlaringiz</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">E'lonlar yuklanmoqda...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Hech qanday boshqarilgan e'lon topilmadi.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnnouncements.map((announcement) => (
                  <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{announcement.title}</h3>
                        {getStatusBadge(announcement.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{announcement.description}</p>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="h-3.5 w-3.5 mr-1" />
                        {announcement.client.username}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {new Date(announcement.created_at).toLocaleDateString("uz-UZ")}
                      </div>
                      <Link href={`/dashboard/announcements/${announcement.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Tafsilotlarni ko'rish
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}