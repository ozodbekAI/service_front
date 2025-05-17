"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchProduct, deleteProduct } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  category_details?: {
    id: number;
    name: string;
    description?: string;
  } | null;
  images: { id: number; image: string }[];
  created_at: string;
  updated_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProduct(Number(productId));
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product. It may not exist.",
        });
        router.push("/dashboard/products");
      } finally {
        setIsLoading(false);
      }
    };

    if (user && productId) {
      loadProduct();
    }
  }, [user, productId, toast, router]);

  const handleDeleteProduct = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(Number(productId));
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        router.push("/dashboard/products?refresh=true");
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete product. Please try again.",
        });
      }
    }
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Out of Stock</Badge>;
    } else if (quantity <= 10) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>;
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please log in to view product details.</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 p-4 sm:p-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-4">The product you are looking for does not exist.</p>
            <Button asChild>
              <Link href="/dashboard/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isManagerOrAdmin = user.role === "admin" || user.role === "manager";

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          {isManagerOrAdmin && (
            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </Button>
          )}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Product Details</h3>
              {getStockBadge(product.quantity)}
            </div>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {product.name}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {product.description || "No description provided"}
              </p>
              <p>
                <span className="font-medium">Price:</span> {product.price} сум
              </p>
              <p>
                <span className="font-medium">Stock:</span> {product.quantity}
              </p>
              <p>
                <span className="font-medium">Category:</span>{" "}
                {product.category_details ? product.category_details.name : "No Category"}
              </p>
              <p>
                <span className="font-medium">Created At:</span>{" "}
                {new Date(product.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Updated At:</span>{" "}
                {new Date(product.updated_at).toLocaleString()}
              </p>
            </div>
            {product.images && product.images.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.images.map((image, index) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.image}
                        alt={`${product.name} image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-md"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}