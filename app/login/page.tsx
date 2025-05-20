"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Monitor, AlertCircle } from "lucide-react"
import { Toaster, toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      toast.success("Tizimga muvaffaqiyatli kirdingiz!")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Tizimga kirishda xato. Iltimos, ma'lumotlaringizni tekshiring.")
      toast.error("Tizimga kirishda xato yuz berdi!")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Monitor className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KompXizmat</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tizimga kirish</CardTitle>
            <CardDescription>Hisobingizga kirish uchun ma'lumotlaringizni kiriting</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Elektron pochta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sizning@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Parol</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Kirilmoqda..." : "Kirish"}
              </Button>
              <div className="text-center text-sm">
                Hisobingiz yo‘qmi?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Ro‘yxatdan o‘tish
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        <Toaster />
      </div>
    </div>
  )
}