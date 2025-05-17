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
import { useToast } from "@/components/ui/use-toast";
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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchManagedAnnouncements();
      setAnnouncements(data);
      setFilteredAnnouncements(data);
    } catch (error) {
      console.error("Failed to load managed announcements:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load managed announcements. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && isManagerOrAdmin) {
      loadAnnouncements();
    }
  }, [user, isManagerOrAdmin]);

  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh") === "true";
    if (shouldRefresh) {
      loadAnnouncements();
      router.replace("/dashboard/announcements/accepted");
    }
  }, [searchParams, router]);

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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please log in to view managed announcements.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
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
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Only admins and managers can view managed announcements.</p>
            <Button asChild>
              <Link href="/dashboard/announcements">Back to Announcements</Link>
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
            <h1 className="text-3xl font-bold tracking-tight">Managed Announcements</h1>
            <p className="text-muted-foreground">Browse all announcements you have accepted or managed</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/announcements">Back to All Announcements</Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              className="pl-10 rounded-lg border border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Your Managed Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading announcements...</div>
            ) : filteredAnnouncements.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No managed announcements found.
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
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </div>
                      <Link href={`/dashboard/announcements/${announcement.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
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