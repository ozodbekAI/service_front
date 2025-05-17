"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { fetchProducts, deleteProduct } from "@/lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category_details: {
    id: number;
    name: string;
  };
  images: { id: number; image: string }[];
}

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("name_asc");

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load products. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  useEffect(() => {
    const shouldRefresh = searchParams.get("refresh") === "true" || searchParams.get("created") === "true";
    if (shouldRefresh) {
      loadProducts();
      router.replace("/dashboard/products");
    }
  }, [searchParams, router]);

  useEffect(() => {
    let result = [...products];
    if (stockFilter === "low") {
      result = result.filter((product) => product.quantity <= 10);
    } else if (stockFilter === "in_stock") {
      result = result.filter((product) => product.quantity > 0);
    } else if (stockFilter === "out_of_stock") {
      result = result.filter((product) => product.quantity === 0);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }
    result.sort((a, b) => {
      if (sortOrder === "name_asc") {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === "name_desc") {
        return b.name.localeCompare(a.name);
      } else if (sortOrder === "price_asc") {
        return a.price - b.price;
      } else if (sortOrder === "price_desc") {
        return b.price - a.price;
      }
      return 0;
    });
    setFilteredProducts(result);
  }, [products, stockFilter, searchQuery, sortOrder]);

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((product) => product.id !== id));
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
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
            <p className="text-muted-foreground mb-4">Please log in to view products.</p>
            <Button onClick={() => router.push("/login")}>
              Go to Login
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
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">Browse and manage products</p>
          </div>
          {isManagerOrAdmin && (
            <div className="flex gap-2">
              <Link href="/dashboard/products/new">
                <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </Link>
              <Link href="/dashboard/products/categories/new">
                <Button variant="outline" className="rounded-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10 rounded-lg border border-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low">Low Stock (≤10)</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[160px] rounded-lg">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No products found.{" "}
                {isManagerOrAdmin && (
                  <Link href="/dashboard/products/new" className="text-primary hover:underline">
                    Add a new product
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        {getStockBadge(product.quantity)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="text-sm mb-2">
                        <span className="font-medium">Price:</span> {product.price} сум
                      </div>
                      <div className="text-sm mb-2">
                        <span className="font-medium">Stock:</span> {product.quantity}
                      </div>
                      <div className="text-sm mb-3">
                        <span className="font-medium">Category:</span>{" "}
                        {product.category_details ? product.category_details.name : "No Category"}
                      </div>
                      {product.images && product.images.length > 0 && (
                        <div className="w-full h-32 overflow-hidden rounded-md mb-3">
                          <img
                            src={product.images[0].image}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/dashboard/products/${product.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full rounded-lg">
                            View Details
                          </Button>
                        </Link>
                        {isManagerOrAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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