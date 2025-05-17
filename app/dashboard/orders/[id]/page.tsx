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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, User, Edit, Trash2, Check, X, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchOrder, startProcessingOrder, rejectOrder, completeOrder, deleteOrder, fetchProducts, fetchWithAuth } from "@/lib/api";

interface Order {
  id: number;
  title: string;
  status: "client_approved" | "in_process" | "completed" | "rejected";
  created_at: string;
  updated_at: string;
  start_time?: string;
  estimated_completion_time?: number;
  estimated_price?: number;
  rejection_reason?: string;
  client: {
    id: number;
    username: string;
    email: string;
  };
  manager?: {
    id: number;
    username: string;
  };
  products: { product: { id: number; name: string }; quantity: number }[];
}

interface Product {
  id: number;
  name: string;
  quantity: number;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");

  useEffect(() => {
    const loadOrder = async () => {
      setIsLoading(true);
      try {
        const data = await fetchOrder(Number(id));
        console.log("Fetched Order:", data);
        setOrder(data);
      } catch (error: any) {
        console.error("Failed to load order:", error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order. Please try again.",
        });
        setOrder(null);
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
      loadOrder();
      if (user.role === "manager" || user.role === "admin") {
        loadProducts();
      }
    }
  }, [id, user]);

  const handleStartProcessing = async () => {
    try {
      const updatedOrder = await startProcessingOrder(Number(id));
      setOrder(updatedOrder);
      toast({
        title: "Success",
        description: "Order is now in process.",
      });
    } catch (error) {
      console.error("Failed to start processing order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start processing order. Please try again.",
      });
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const updatedOrder = await completeOrder(Number(id));
      setOrder(updatedOrder);
      toast({
        title: "Success",
        description: "Order marked as completed.",
      });
    } catch (error) {
      console.error("Failed to complete order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete order. Please try again.",
      });
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectionReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason.",
      });
      return;
    }

    try {
      const updatedOrder = await rejectOrder(Number(id), rejectionReason);
      setOrder(updatedOrder);
      toast({
        title: "Success",
        description: "Order rejected successfully.",
      });
    } catch (error) {
      console.error("Failed to reject order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject order. Please try again.",
      });
    }
  };

  const handleDeleteOrder = async () => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(Number(id));
        toast({
          title: "Success",
          description: "Order deleted successfully.",
        });
        router.push("/dashboard/orders");
      } catch (error) {
        console.error("Failed to delete order:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete order. Please try again.",
        });
      }
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProduct || !productQuantity) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a product and specify a quantity.",
      });
      return;
    }

    try {
      const response = await fetchWithAuth(`/application/orders/${id}/add_product/`, {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(selectedProduct),
          quantity: Number(productQuantity),
        }),
      });
      setOrder(response);
      setSelectedProduct("");
      setProductQuantity("1");
      toast({
        title: "Success",
        description: "Product added to order.",
      });
    } catch (error) {
      console.error("Failed to add product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product. Please try again.",
      });
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    try {
      const response = await fetchWithAuth(`/application/orders/${id}/remove_product/`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      setOrder(response);
      toast({
        title: "Success",
        description: "Product removed from order.",
      });
    } catch (error) {
      console.error("Failed to remove product:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove product. Please try again.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "client_approved":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Client Approved</Badge>;
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

  const getTimeRemaining = () => {
    if (order?.status !== "in_process" || !order?.start_time || !order?.estimated_completion_time) {
      return null;
    }
    const start = new Date(order.start_time);
    const end = new Date(start.getTime() + order.estimated_completion_time * 60 * 60 * 1000);
    const now = new Date();
    if (now > end) {
      return "Overdue";
    }
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-4">The order you are looking for does not exist.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Permission checks after confirming order is not null
  const isOwner = user?.id === order.client.id;
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isManagerOrAdmin = isManager || isAdmin;
  const canEdit = isOwner && order.status === "client_approved";
  const canManage = isManagerOrAdmin && order.status !== "completed" && order.status !== "rejected";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          {getStatusBadge(order.status)}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">{order.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.products?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Assigned Products</h3>
                      <ul className="list-disc pl-5">
                        {order.products.map((item, index) => (
                          <li key={index} className="text-sm">
                            {item.product.name} (Quantity: {item.quantity})
                            {isManagerOrAdmin && order.status !== "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2 text-red-500"
                                onClick={() => handleRemoveProduct(item.product.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {order.estimated_price && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Estimated Price</h3>
                      <p>{order.estimated_price} сум</p>
                    </div>
                  )}
                  {order.estimated_completion_time && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Estimated Completion Time</h3>
                      <p>{order.estimated_completion_time} hours</p>
                    </div>
                  )}
                  {isOwner && order.status === "in_process" && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Time Remaining</h3>
                      <p>{getTimeRemaining() || "Calculating..."}</p>
                    </div>
                  )}
                  {order.rejection_reason && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-red-600 mb-2">Rejection Reason</h3>
                      <p>{order.rejection_reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Client</p>
                      <p className="text-sm text-muted-foreground">{order.client.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium">Contact Email</p>
                    <p className="text-sm text-muted-foreground ml-2">{order.client.email}</p>
                  </div>
                  {order.manager && (
                    <>
                      <Separator />
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Manager</p>
                          <p className="text-sm text-muted-foreground">{order.manager.username}</p>
                        </div>
                      </div>
                    </>
                  )}
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
                      onClick={() => router.push(`/dashboard/orders/${id}/edit`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Order
                    </Button>
                    <Button
                      className="w-full"
                      variant="destructive"
                      onClick={handleDeleteOrder}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Order
                    </Button>
                  </>
                )}
                {canManage && (
                  <>
                    {order.status === "client_approved" && (
                      <Button
                        className="w-full border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                        variant="outline"
                        onClick={handleStartProcessing}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Start Processing
                      </Button>
                    )}
                    {order.status === "in_process" && (
                      <Button
                        className="w-full border-green-500 text-green-500 hover:bg-green-50"
                        variant="outline"
                        onClick={handleCompleteOrder}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Complete Order
                      </Button>
                    )}
                    {order.status !== "completed" && order.status !== "rejected" && (
                      <>
                        <div className="space-y-2">
                          <Label>Add Product</Label>
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
                          <Input
                            type="number"
                            min="1"
                            value={productQuantity}
                            onChange={(e) => setProductQuantity(e.target.value)}
                            placeholder="Quantity"
                          />
                          <Button onClick={handleAddProduct} className="w-full">
                            Add Product
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>Rejection Reason</Label>
                          <Input
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection"
                          />
                          <Button
                            className="w-full border Jesus Christ border-red-500 text-red-500 hover:bg-red-50"
                            variant="outline"
                            onClick={handleRejectOrder}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject Order
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}
                {!canEdit && !canManage && user && (
                  <p className="text-sm text-muted-foreground text-center">
                    No actions available for this order.
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