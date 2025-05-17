"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { createAnnouncement, uploadAnnouncementImages } from "@/lib/api";

interface AnnouncementFormData {
  title: string;
  description: string;
  region: string;
}

export default function NewAnnouncementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    description: "",
    region: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors && errors[name]) {
      setErrors((prev) => ({ ...prev!, [name]: [] }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors(null);

    try {
      if (!formData.title || !formData.description || !formData.region) {
        throw new Error("Please fill in all required fields");
      }

      const announcementData = {
        title: formData.title,
        description: formData.description,
        region: formData.region,
      };
      const newAnnouncement = await createAnnouncement(announcementData);

      if (images.length > 0) {
        const formDataImages = new FormData();
        images.forEach((image) => {
          formDataImages.append("image", image);
          formDataImages.append("announcement_id", newAnnouncement.id.toString());
        });
        await uploadAnnouncementImages(formDataImages);
      }

      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });
      router.push(`/dashboard/announcements?refresh=true`);
    } catch (error: any) {
      console.error("Failed to create announcement:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: [error.message || "Failed to create announcement. Please try again."] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || (user.role !== "client" && !user.role=="admin" && !user.role=="manager")) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Only clients, managers, or admins can create announcements.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Announcements
          </Button>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Create New Announcement</CardTitle>
                <p className="text-muted-foreground">Post a new service announcement</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors?.general && (
                  <p className="text-red-500 mb-4">{errors.general.join(", ")}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Announcement Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Laptop Repair Services"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                  {errors?.title && (
                    <p className="text-red-500 text-sm">{errors.title.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your service in detail..."
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                  {errors?.description && (
                    <p className="text-red-500 text-sm">{errors.description.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    placeholder="e.g., Tashkent"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    className="rounded-lg"
                  />
                  {errors?.region && (
                    <p className="text-red-500 text-sm">{errors.region.join(", ")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Images (Optional)</Label>
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center">
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md hover:bg-muted/50 transition-colors"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Click to upload images</span>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 rounded-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Announcement..." : "Create Announcement"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}