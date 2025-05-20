import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Monitor, Cpu, Settings, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Monitor className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KompXizmat</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Tizimga kirish</Button>
            </Link>
            <Link href="/register">
              <Button>Ro‘yxatdan o‘tish</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Professional Kompyuter Ta'mirlash va Xizmat</h1>
              <p className="text-xl mb-8 text-muted-foreground">
                Barcha texnologik ehtiyojlaringiz uchun tez va ishonchli kompyuter ta'mirlash xizmatlari. Mutaxassislarimiz bugun sizga yordam berishga tayyor.
              </p>
              <Link href="/register">
                <Button size="lg" className="mr-4">
                  Boshlash
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Tizimga kirish
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Bizning Xizmatlarimiz</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Uskuna Ta'mirlash</h3>
                <p className="text-muted-foreground">Barcha kompyuter uskuna muammolari uchun mutaxassis tashxisi va ta'mirlash.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Dasturiy Yechimlar</h3>
                <p className="text-muted-foreground">Dasturiy ta'minot o'rnatish, yangilash va nosozliklarni bartaraf etish xizmatlari.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
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
                Hozir Ro‘yxatdan O‘tish
              </Button>
            </Link>
          </div>
        </section>
      </main>

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
    </div>
  )
}