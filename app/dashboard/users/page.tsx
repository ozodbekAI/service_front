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
import { fetchUsers, makeUserManager, removeUserManager } from "@/lib/api"

interface User {
  id: number
  username: string
  email: string
  phone: string
  role: "user" | "manager" | "admin"
  date_joined: string
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
      } catch (error) {
        console.error("Failed to load users:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === "admin") {
      loadUsers()
    }
  }, [user])

  // For demo purposes, we'll use placeholder data if the API calls aren't implemented
  useEffect(() => {
    if (isLoading && users.length === 0) {
      // Placeholder data
      const mockUsers: User[] = [
        {
          id: 1,
          username: "admin_user",
          email: "admin@example.com",
          phone: "+998901234567",
          role: "admin",
          date_joined: "2023-01-01T10:00:00Z",
        },
        {
          id: 2,
          username: "manager_user",
          email: "manager@example.com",
          phone: "+998901234568",
          role: "manager",
          date_joined: "2023-02-15T14:30:00Z",
        },
        {
          id: 3,
          username: "john_doe",
          email: "john@example.com",
          phone: "+998901234569",
          role: "user",
          date_joined: "2023-03-10T09:15:00Z",
        },
        {
          id: 4,
          username: "jane_smith",
          email: "jane@example.com",
          phone: "+998901234570",
          role: "user",
          date_joined: "2023-04-05T11:45:00Z",
        },
        {
          id: 5,
          username: "alex_jones",
          email: "alex@example.com",
          phone: "+998901234571",
          role: "user",
          date_joined: "2023-05-20T16:20:00Z",
        },
      ]

      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setIsLoading(false)
    }
  }, [isLoading, users.length])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...users]

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query),
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortOrder === "username-asc") {
        return a.username.localeCompare(b.username)
      } else if (sortOrder === "username-desc") {
        return b.username.localeCompare(a.username)
      } else if (sortOrder === "date-asc") {
        return new Date(a.date_joined).getTime() - new Date(b.date_joined).getTime()
      } else if (sortOrder === "date-desc") {
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
    } catch (error) {
      console.error("Failed to make user a manager:", error)
      alert("Failed to update user role. Please try again.")
    }
  }

  const handleRemoveManager = async (userId: number) => {
    try {
      await removeUserManager(userId)
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, role: "user" } : u)))
    } catch (error) {
      console.error("Failed to remove manager role:", error)
      alert("Failed to update user role. Please try again.")
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
            Manager
          </Badge>
        )
      case "user":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <UserIcon className="mr-1 h-3 w-3" />
            Client
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  // Only admin can access this page
  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You don&apos;t have permission to view this page.</p>
            <Link href="/dashboard">
              <Button>Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage system users and their roles</p>
          </div>
          <Link href="/dashboard/users/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
                <SelectItem value="user">Clients</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="username-asc">Name (A-Z)</SelectItem>
                <SelectItem value="username-desc">Name (Z-A)</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all system users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Username</th>
                      <th className="text-left py-3 px-2">Contact</th>
                      <th className="text-left py-3 px-2">Role</th>
                      <th className="text-left py-3 px-2">Joined</th>
                      <th className="text-right py-3 px-2">Actions</th>
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
                          <div className="text-sm">{new Date(user.date_joined).toLocaleDateString()}</div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end space-x-2">
                            {user.role !== "admin" && (
                              <>
                                {user.role === "user" ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMakeManager(user.id)}
                                    className="text-blue-600"
                                  >
                                    <UserCheck className="mr-1 h-4 w-4" />
                                    Make Manager
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveManager(user.id)}
                                    className="text-yellow-600"
                                  >
                                    <UserX className="mr-1 h-4 w-4" />
                                    Remove Manager
                                  </Button>
                                )}
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
      </div>
    </DashboardLayout>
  )
}
