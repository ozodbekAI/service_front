"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowUpDown, UserPlus, Shield, ShieldAlert, UserIcon, UserCheck, UserX } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/use-auth"
import { Toaster, toast } from "react-hot-toast"
import { fetchUsers, makeUserManager, removeUserManager } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  phone: string
  role: "client" | "manager" | "admin"  // API dan kelayotgan rol nomi
  date_joined?: string
  company_name?: string | null
  is_legal?: boolean
}

export default function UsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("username-asc")

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      try {
        const data = await fetchUsers()
        setUsers(data)
        setFilteredUsers(data)
        toast.success("Foydalanuvchilar muvaffaqiyatli yuklandi!")
      } catch (error) {
        console.error("Foydalanuvchilarni yuklashda xato:", error)
        toast.error("Foydalanuvchilarni yuklashda xato yuz berdi!")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === "admin") {
      loadUsers()
    }
  }, [user])

  // Filtrlash va saralashni qo'llash
  useEffect(() => {
    let result = [...users]

    // Rol bo'yicha filtr
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter)
    }

    // Qidiruv bo'yicha filtr
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query),
      )
    }

    // Saralash
    result.sort((a, b) => {
      if (sortOrder === "username-asc") {
        return a.username.localeCompare(b.username)
      } else if (sortOrder === "username-desc") {
        return b.username.localeCompare(a.username)
      } else if (sortOrder === "date-asc" && a.date_joined && b.date_joined) {
        return new Date(a.date_joined).getTime() - new Date(b.date_joined).getTime()
      } else if (sortOrder === "date-desc" && a.date_joined && b.date_joined) {
        return new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime()
      }
      return 0
    })

    setFilteredUsers(result)
  }, [users, roleFilter, searchQuery, sortOrder])

  const handleMakeManager = async (userId: number) => {
    try {
      await makeUserManager(userId)
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, role: "manager" } : u)))
      toast.success("Foydalanuvchi muvaffaqiyatli menejer qilindi!")
    } catch (error) {
      console.error("Failed to make user a manager:", error)
      toast.error("Foydalanuvchi rolini yangilashda xato yuz berdi. Iltimos, qayta urinib ko'ring.")
    }
  }

  const handleRemoveManager = async (userId: number) => {
    try {
      await removeUserManager(userId)
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, role: "client" } : u)))
      toast.success("Menejerlik roli muvaffaqiyatli olib tashlandi!")
    } catch (error) {
      console.error("Failed to remove manager role:", error)
      toast.error("Foydalanuvchi rolini yangilashda xato yuz berdi. Iltimos, qayta urinib ko'ring.")
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        )
      case "manager":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="mr-1 h-3 w-3" />
            Menejer
          </Badge>
        )
      case "client":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserIcon className="mr-1 h-3 w-3" />
            Mijoz
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  // Faqat admin ushbu sahifaga kira oladi
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Kirish taqiqlangan</h1>
            <p className="text-muted-foreground mb-4">Sizda ushbu sahifani ko'rish uchun ruxsat yo'q.</p>
            <Link href="/dashboard">
              <Button>Boshqaruv paneliga qaytish</Button>
            </Link>
          </div>
        </div>
        <Toaster />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Foydalanuvchilar</h1>
            <p className="text-muted-foreground">Tizim foydalanuvchilari va ularning rollarini boshqarish</p>
          </div>
          <Link href="/dashboard/users/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Foydalanuvchi qo'shish
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Foydalanuvchilarni qidirish..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Barcha rollar</SelectItem>
                <SelectItem value="admin">Adminlar</SelectItem>
                <SelectItem value="manager">Menejerlar</SelectItem>
                <SelectItem value="client">Mijozlar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Saralash" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="username-asc">Ism (A-Z)</SelectItem>
                <SelectItem value="username-desc">Ism (Z-A)</SelectItem>
                <SelectItem value="date-asc">Avvalgi birinchi</SelectItem>
                <SelectItem value="date-desc">Yangisi birinchi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Foydalanuvchilarni boshqarish</CardTitle>
            <CardDescription>Barcha tizim foydalanuvchilarini ko'rish va boshqarish</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Foydalanuvchilar yuklanmoqda...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">Foydalanuvchilar topilmadi.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Foydalanuvchi nomi</th>
                      <th className="text-left py-3 px-2">Aloqa</th>
                      <th className="text-left py-3 px-2">Rol</th>
                      <th className="text-left py-3 px-2">Qo'shilgan sana</th>
                      <th className="text-right py-3 px-2">Amallar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div className="font-medium">{user.username}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">{user.email}</div>
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        </td>
                        <td className="py-3 px-2">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            {user.date_joined 
                              ? new Date(user.date_joined).toLocaleDateString("uz-UZ")
                              : "Ma'lumot yo'q"
                            }
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end space-x-2">
                            {user.role !== "admin" && (
                              <>
                                {user.role === "client" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMakeManager(user.id)}
                                    className="text-blue-600"
                                  >
                                    <UserCheck className="mr-1 h-4 w-4" />
                                    Menejer qilish
                                  </Button>
                                ) : user.role === "manager" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveManager(user.id)}
                                    className="text-yellow-600"
                                  >
                                    <UserX className="mr-1 h-4 w-4" />
                                    Menejerlikni olib tashlash
                                  </Button>
                                ) : null}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        <Toaster />
      </div>
    </DashboardLayout>
  )
}