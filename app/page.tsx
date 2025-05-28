"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, Cpu, Settings, Users, User, Briefcase, MapPin, Wrench, FileText, Phone, Mail, Image } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { uuploadAnnouncementImages } from "@/lib/api"; 
import { Checkbox } from "@/components/ui/checkbox"; // Checkbox komponentini import qilish
import { Label } from "@/components/ui/label"; // Label komponentini import qilish

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientType: "individual",
    fullName: "",
    companyName: "",
    district: "",
    serviceType: "hardware",
    description: "",
    phone: "",
    email: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false); // Checkbox holatini boshqarish

  const clientTypeRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isFormOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isFormOpen]);

  useEffect(() => {
    if (isFormOpen && clientTypeRef.current) {
      clientTypeRef.current.focus();
    }
  }, [isFormOpen]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 3) {
      toast.error("Faqat 3 ta rasm yuklash mumkin!");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacyAccepted(checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!privacyAccepted) {
      toast.error("Iltimos, maxfiylik siyosati bilan rozilikni tasdiqlang!");
      return;
    }

    setIsLoading(true);

    const payload = {
      fullname: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      is_legal: formData.clientType === "legal",
      company_name: formData.clientType === "legal" ? formData.companyName : undefined,
      announcement: {
        title: `Buyurtma: ${formData.serviceType === "hardware" ? "Uskuna" : "Dasturiy ta'minot"} - ${formData.fullName}`,
        description: formData.description,
        district: formData.district,
        service_type: formData.serviceType,
        privacy_accepted: privacyAccepted, // Backend uchun maxfiylik roziligi
      },
    };

    try {
      const response = await fetch("https://pc.ustaxona.bazarchi.software/api/v1/user/register_and_announce/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      }

      const responseData = await response.json();
      const announcementId = responseData.announcement?.id;
      const accessToken = responseData.access_token || null;

      if (!announcementId) {
        throw new Error("Announcement ID not returned from server.");
      }

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        if (responseData.refresh_token) {
          localStorage.setItem("refresh_token", responseData.refresh_token);
        }
      }

      if (images.length > 0) {
        const formDataImages = new FormData();
        images.forEach((image) => {
          formDataImages.append("image", image);
        });
        formDataImages.append("announcement_id", announcementId);
        await uuploadAnnouncementImages(formDataImages, accessToken);
      }

      toast.success("Ro'yxatdan o'tish va buyurtma muvaffaqiyatli! Parolingiz email orqali yuborildi.");
      setIsFormOpen(false);
      setFormData({
        clientType: "individual",
        fullName: "",
        companyName: "",
        district: "",
        serviceType: "hardware",
        description: "",
        phone: "",
        email: "",
      });
      setImages([]);
      setImagePreviews([]);
      setPrivacyAccepted(false); // Checkboxni qayta tiklash
    } catch (error) {
      toast.error(
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message || "Server bilan bog'lanishda xatolik yuz berdi."
          : "Server bilan bog'lanishda xatolik yuz berdi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <Monitor className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">KompXizmat</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Tizimga kirish</Button>
              </Link>
              <Link href="/register" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Ro'yxatdan o'tish</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20 min-h-[600px] flex items-center" 
          style={{ 
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/back3.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Professional Kompyuter Ta'mirlash va Xizmat
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                Barcha texnologik ehtiyojlaringiz uchun tez va ishonchli kompyuter ta'mirlash xizmatlari. 
                Mutaxassislarimiz bugun sizga yordam berishga tayyor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => setIsFormOpen(true)} 
                  disabled={isLoading}
                >
                  Buyurtma berish
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300"
                  >
                    Tizimga kirish
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </section>

        {/* Modal (Buyurtma berish formasi) */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Buyurtma berish</h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Mijoz turi
                    </label>
                    <select
                      name="clientType"
                      value={formData.clientType}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                      ref={clientTypeRef}
                    >
                      <option value="individual">Jismoniy shaxs</option>
                      <option value="legal">Yuridik shaxs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      F.I.SH
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>
                  {formData.clientType === "legal" && (
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                        <Briefcase className="h-5 w-5 mr-2 text-primary" />
                        Kompaniya nomi
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-primary" />
                      Tuman
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <Wrench className="h-5 w-5 mr-2 text-primary" />
                      Xizmat turi
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    >
                      <option value="hardware">Uskuna (Hardware)</option>
                      <option value="software">Dasturiy ta'minot (Software)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <Phone className="h-5 w-5 mr-2 text-primary" />
                      Telefon raqami
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-primary" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Muammo tavsifi
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                      <Image className="h-5 w-5 mr-2 text-primary" />
                      Rasmlar (maksimum 3 ta)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Maxfiylik siyosati uchun Checkbox */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="privacy-policy"
                        checked={privacyAccepted}
                        onCheckedChange={handlePrivacyChange}
                      />
                      <Label htmlFor="privacy-policy" className="text-sm text-gray-600">
                        Men{" "}
                        <Link
                          href="/privacy-policy"
                          className="text-blue-500 hover:underline"
                          target="_blank"
                        >
                          maxfiylik siyosati
                        </Link>{" "}
                        va shaxsiy ma'lumotlarimni O‘zbekiston Respublikasining “Shaxsiy ma’lumotlarni himoya qilish to‘g‘risida”gi qonuni (№547, 2019-yil) hamda GDPR (Yevropa Ittifoqi, 2016/679) talablariga muvofiq qayta ishlashga roziman.
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                    onClick={() => setIsFormOpen(false)}
                    disabled={isLoading}
                  >
                    Bekor qilish
                  </button>
                  <Button
                    type="submit"
                    disabled={isLoading || !privacyAccepted} // Checkbox belgilangan bo‘lsa faqat faol
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                  >
                    {isLoading ? "Yuborilmoqda..." : "Yuborish"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Services Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Bizning Xizmatlarimiz</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Uskuna Ta'mirlash</h3>
                <p className="text-muted-foreground">Barcha kompyuter uskuna muammolari uchun mutaxassis tashxisi va ta'mirlash.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dasturiy Yechimlar</h3>
                <p className="text-muted-foreground">Dasturiy ta'minot o'rnatish, yangilash va nosozliklarni bartaraf etish xizmatlari.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">AT Maslahati</h3>
                <p className="text-muted-foreground">Texnologiya xaridlari va yangilashlar bo'yicha professional maslahat.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Kompyuteringiz muammolarini hal qilishga tayyormisiz?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Bugun platformamizga qo'shiling va professional kompyuter ta'mirlash xizmatlariga ega bo'ling.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="font-semibold">
                Hozir Ro'yxatdan O'tish
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Monitor className="h-5 w-5 text-primary" />
              <span className="font-semibold">KompXizmat</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kompyuter Xizmatlarini Boshqarish. Barcha huquqlar himoyalangan.
            </div>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}