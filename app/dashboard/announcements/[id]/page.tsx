"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, User, Edit, Trash2, Check, X, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchAnnouncement, acceptAnnouncement, rejectAnnouncement, clientApproveAnnouncement, clientRejectAnnouncement, deleteAnnouncement, fetchProducts, fetchWithAuth, uploadAnnouncementImages } from "@/lib/api";

interface Announcement {
  id: number;
  title: string;
  description: string;
  status: "pending" | "accepted" | "in_process" | "completed" | "rejected";
  created_at: string;
  estimated_price?: number;
  estimated_completion_time?: number;
  rejection_reason?: string;
  client: {
    id: number;
    username: string;
    email: string;
  };
  images?: { id: number; image: string }[];
}

interface Product {
  id: number;
  name: string;
  quantity: number;
}

export default function AnnouncementDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [acceptData, setAcceptData] = useState({
    estimated_completion_time: "",
    estimated_price: "",
    products: [] as { product_id: number; quantity: number }[],
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [clientRejectionReason, setClientRejectionReason] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const loadAnnouncement = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAnnouncement(Number(id));
        setAnnouncement(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].image);
        }
      } catch (error) {
        console.error("Failed to load announcement:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load announcement. Please try again.",
        });
        setAnnouncement(null);
      } finally {
        setIsLoading(false);
      }
    };

    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load products. Please try again.",
        });
      }
    };

    if (user) {
      loadAnnouncement();
      if (user.role === "admin" || user.role === "manager") {
        loadProducts();
      }
    }
  }, [id, user]);

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an image to upload.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("announcement_id", id.toString());
    console.log('Uploading FormData:', Object.fromEntries(formData));

    try {
      await uploadAnnouncementImages(formData);
      const updatedAnnouncement = await fetchAnnouncement(Number(id));
      setAnnouncement(updatedAnnouncement);
      setImageFile(null);
      if (updatedAnnouncement.images && updatedAnnouncement.images.length > 0) {
        setSelectedImage(updatedAnnouncement.images[updatedAnnouncement.images.length - 1].image);
      }
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });
    } catch (error: any) {
      console.error("Failed to upload image:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to upload image. Please try again.",
      });
    }
  };

  const handleAcceptAnnouncement = async () => {
    if (!acceptData.estimated_completion_time || !acceptData.estimated_price) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide estimated time and price.",
      });
      return;
    }

    try {
      const updatedAnnouncement = await acceptAnnouncement(Number(id), {
        estimated_completion_time: Number(acceptData.estimated_completion_time),
        estimated_price: Number(acceptData.estimated_price),
        products: acceptData.products,
      });
      setAnnouncement(updatedAnnouncement);
      toast({
        title: "Success",
        description: "Announcement accepted successfully!",
      });
    } catch (error: any) {
      console.error("Failed to accept announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept announcement. Please try again.",
      });
    }
  };

  const handleRejectAnnouncement = async () => {
    if (!rejectionReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason.",
      });
      return;
    }

    try {
      const updatedAnnouncement = await rejectAnnouncement(Number(id), rejectionReason);
      setAnnouncement(updatedAnnouncement);
      toast({
        title: "Success",
        description: "Announcement rejected successfully!",
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

  const handleClientApprove = async () => {
    try {
      const updatedAnnouncement = await clientApproveAnnouncement(Number(id));
      setAnnouncement(updatedAnnouncement);
      toast({
        title: "Success",
        description: "Announcement approved successfully! Order created.",
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

  const handleClientReject = async () => {
    if (!clientRejectionReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason.",
      });
      return;
    }

    try {
      const updatedAnnouncement = await clientRejectAnnouncement(Number(id), clientRejectionReason);
      setAnnouncement(updatedAnnouncement);
      setClientRejectionReason("");
      toast({
        title: "Success",
        description: "Announcement rejected successfully!",
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

  const handleDeleteAnnouncement = async () => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      try {
        await deleteAnnouncement(Number(id));
        toast({
          title: "Success",
          description: "Announcement deleted successfully!",
        });
        router.push("/dashboard/announcements");
      } catch (error) {
        console.error("Failed to delete announcement:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete announcement. Please try again.",
        });
      }
    }
  };

  const addProduct = () => {
    if (!selectedProduct) return;
    const product = products.find((p) => p.id === Number(selectedProduct));
    if (product) {
      setAcceptData((prev) => ({
        ...prev,
        products: [...prev.products, { product_id: product.id, quantity: 1 }],
      }));
      setSelectedProduct("");
    }
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    setAcceptData((prev) => {
      const newProducts = [...prev.products];
      newProducts[index].quantity = quantity;
      return { ...prev, products: newProducts };
    });
  };

  const removeProduct = (index: number) => {
    setAcceptData((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Accepted</Badge>;
      case "in_process":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">In Process</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we load the announcement details.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!announcement) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Announcement Not Found</h1>
            <p className="text-muted-foreground mb-4">The announcement you are looking for does not exist.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Define permissions only if announcement is not null
  const isOwner = user?.id === announcement.client.id;
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager" && !isAdmin;
  const isManagerOrAdmin = isAdmin || isManager;
  const canEdit = isOwner && announcement.status === "pending";
  const canAcceptOrReject = isManagerOrAdmin && announcement.status === "pending";
  const canClientApproveOrReject = isOwner && announcement.status === "accepted";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
          {getStatusBadge(announcement.status)}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Posted on {new Date(announcement.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcement.images && announcement.images.length > 0 ? (
                    <div className="space-y-2">
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        <img
                          src={selectedImage || announcement.images[0].image}
                          alt={announcement.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {announcement.images.map((image) => (
                          <div
                            key={image.id}
                            className={`w-full aspect-square rounded-md overflow-hidden cursor-pointer ${
                              selectedImage === image.image ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedImage(image.image)}
                          >
                            <img
                              src={image.image}
                              alt={`Image ${image.id}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No images available for this announcement.
                    </div>
                  )}
                  {canEdit && (
                    <div className="space-y-2">
                      <Label>Upload Image</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        />
                        <Button
                          onClick={handleImageUpload}
                          disabled={!imageFile}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="whitespace-pre-line">{announcement.description}</p>
                  </div>
                  {announcement.estimated_price && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Estimated Price</h3>
                      <p>{announcement.estimated_price.toLocaleString()} сум</p>
                    </div>
                  )}
                  {announcement.estimated_completion_time && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Estimated Completion Time</h3>
                      <p>{announcement.estimated_completion_time} hours</p>
                    </div>
                  )}
                  {announcement.rejection_reason && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-red-600 mb-2">Rejection Reason</h3>
                      <p>{announcement.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Announcement Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Posted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(announcement.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Posted By</p>
                      <p className="text-sm text-muted-foreground">{announcement.client.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium">Contact Email</p>
                    <p className="text-sm text-muted-foreground ml-2">{announcement.client.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {canEdit && (
                  <>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/announcements/${id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Announcement
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleDeleteAnnouncement}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Announcement
                    </Button>
                  </>
                )}
                {canAcceptOrReject && (
                  <>
                    <div className="space-y-2">
                      <Label>Estimated Completion Time (hours)</Label>
                      <Input
                        type="number"
                        value={acceptData.estimated_completion_time}
                        onChange={(e) =>
                          setAcceptData({ ...acceptData, estimated_completion_time: e.target.value })
                        }
                        placeholder="24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Price (сум)</Label>
                      <Input
                        type="number"
                        value={acceptData.estimated_price}
                        onChange={(e) =>
                          setAcceptData({ ...acceptData, estimated_price: e.target.value })
                        }
                        placeholder="100000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Add Products</Label>
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (Stock: {product.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addProduct} className="w-full mt-2">
                        Add Product
                      </Button>
                    </div>
                    {acceptData.products.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium">Selected Products</h4>
                        {acceptData.products.map((prod, index) => {
                          const product = products.find((p) => p.id === prod.product_id);
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <span>{product?.name || 'Unknown Product'}</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="1"
                                  value={prod.quantity}
                                  onChange={(e) => updateProductQuantity(index, Number(e.target.value))}
                                  className="w-20"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeProduct(index)}
                                  className="text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <Button
                      className="w-full border-green-500 text-green-500 hover:bg-green-50"
                      variant="outline"
                      onClick={handleAcceptAnnouncement}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <div className="space-y-2">
                      <Label>Rejection Reason</Label>
                      <Input
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Reason for rejection"
                      />
                    </div>
                    <Button
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                      variant="outline"
                      onClick={handleRejectAnnouncement}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                {canClientApproveOrReject && (
                  <>
                    <Button
                      className="w-full border-green-500 text-green-500 hover:bg-green-50"
                      variant="outline"
                      onClick={handleClientApprove}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve Order
                    </Button>
                    <div className="space-y-2">
                      <Label>Rejection Reason</Label>
                      <Input
                        value={clientRejectionReason}
                        onChange={(e) => setClientRejectionReason(e.target.value)}
                        placeholder="Reason for rejection"
                      />
                    </div>
                    <Button
                      className="w-full border-red-500 text-red-500 hover:bg-red-50"
                      variant="outline"
                      onClick={handleClientReject}
                      disabled={!clientRejectionReason}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject Order
                    </Button>
                  </>
                )}
                {!canEdit && !canAcceptOrReject && !canClientApproveOrReject && user && (
                  <p className="text-sm text-muted-foreground text-center">
                    No actions available for this announcement.
                  </p>
                )}
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please log in to take actions.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}