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
import { Monitor, AlertCircle, X } from "lucide-react"
import { Toaster, toast } from "react-hot-toast"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotError, setForgotError] = useState("")
  const [isForgotLoading, setIsForgotLoading] = useState(false)

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

 const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError("")
    setIsForgotLoading(true)

    try {
      const response = await fetch("https://pc.ustaxona.bazarchi.software/api/v1/user/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Parolni tiklashda xato yuz berdi.")
      }

      toast.success("Yangi parol email manzilingizga yuborildi!")
      setIsForgotPasswordOpen(false)
      setForgotEmail("")
    } catch (err: any) {
      setForgotError(err.message || "Server bilan bog'lanishda xato yuz berdi.")
      toast.error(err.message || "Parolni tiklashda xato yuz berdi!")
    } finally {
      setIsForgotLoading(false)
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
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline"
                    onClick={() => setIsForgotPasswordOpen(true)}
                  >
                    Parolni unutdingizmi?
                  </button>
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

        {/* Forgot Password Modal */}
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Parolni tiklash</h2>
                <button
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="space-y-4">
                  {forgotError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{forgotError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Elektron pochta</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="sizning@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? "Yuborilmoqda..." : "Yuborish"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Toaster />
      </div>
    </div>
  )
}
