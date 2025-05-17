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
            <span className="text-xl font-bold">CompService</span>
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Professional Computer Repair & Service</h1>
              <p className="text-xl mb-8 text-muted-foreground">
                Fast, reliable computer repair services for all your tech needs. Our experts are ready to help you
                today.
              </p>
              <Link href="/register">
                <Button size="lg" className="mr-4">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Hardware Repair</h3>
                <p className="text-muted-foreground">Expert diagnosis and repair for all computer hardware issues.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Software Solutions</h3>
                <p className="text-muted-foreground">Software installation, updates, and troubleshooting services.</p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border">
                <div className="mb-4 bg-primary/10 p-3 rounded-full w-fit">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">IT Consultation</h3>
                <p className="text-muted-foreground">Professional advice on technology purchases and upgrades.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to fix your computer issues?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join our platform today and get access to professional computer repair services.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="font-semibold">
                Sign Up Now
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
              <span className="font-semibold">CompService</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Computer Service Management. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
