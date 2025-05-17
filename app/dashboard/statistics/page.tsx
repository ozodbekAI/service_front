"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ClipboardList, Users, Package, DollarSign, TrendingUp, Calendar } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Mock data for charts
const weeklyOrdersData = [
  { name: "Mon", orders: 4, completed: 3, rejected: 1 },
  { name: "Tue", orders: 6, completed: 4, rejected: 0 },
  { name: "Wed", orders: 8, completed: 5, rejected: 1 },
  { name: "Thu", orders: 10, completed: 7, rejected: 2 },
  { name: "Fri", orders: 12, completed: 9, rejected: 1 },
  { name: "Sat", orders: 8, completed: 6, rejected: 0 },
  { name: "Sun", orders: 5, completed: 4, rejected: 0 },
]

const monthlyOrdersData = [
  { name: "Jan", orders: 30, completed: 25, rejected: 5 },
  { name: "Feb", orders: 40, completed: 32, rejected: 8 },
  { name: "Mar", orders: 45, completed: 38, rejected: 7 },
  { name: "Apr", orders: 55, completed: 45, rejected: 10 },
  { name: "May", orders: 60, completed: 50, rejected: 10 },
  { name: "Jun", orders: 70, completed: 60, rejected: 10 },
  { name: "Jul", orders: 75, completed: 65, rejected: 10 },
  { name: "Aug", orders: 80, completed: 70, rejected: 10 },
  { name: "Sep", orders: 85, completed: 75, rejected: 10 },
  { name: "Oct", orders: 90, completed: 80, rejected: 10 },
  { name: "Nov", orders: 95, completed: 85, rejected: 10 },
  { name: "Dec", orders: 100, completed: 90, rejected: 10 },
]

const productCategoryData = [
  { name: "Storage", value: 35 },
  { name: "Memory", value: 25 },
  { name: "Processors", value: 20 },
  { name: "Peripherals", value: 15 },
  { name: "Other", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function StatisticsPage() {
  const { user } = useAuth()
  const [timeRange, setTimeRange] = useState("weekly")
  const [isLoading, setIsLoading] = useState(false)

  // Only admin and manager can access this page
  const isAdmin = user?.role === "admin"
  const isManager = user?.role === "manager" || isAdmin

  if (!isManager) {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-muted-foreground">Analyze system performance and trends</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <p className="text-xs text-muted-foreground">+4 new clients this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">132</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Order Statistics</CardTitle>
                    <CardDescription>Overview of order trends</CardDescription>
                  </div>
                  <div className="flex space-x-2 mt-2 sm:mt-0">
                    <Button
                      variant={timeRange === "weekly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange("weekly")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Weekly
                    </Button>
                    <Button
                      variant={timeRange === "monthly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange("monthly")}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Monthly
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timeRange === "weekly" ? weeklyOrdersData : monthlyOrdersData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#3b82f6" name="Total Orders" />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" />
                      <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Completion Rate</CardTitle>
                  <CardDescription>Percentage of orders completed successfully</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={timeRange === "weekly" ? weeklyOrdersData : monthlyOrdersData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#10b981"
                          activeDot={{ r: 8 }}
                          name="Completed Orders"
                        />
                        <Line type="monotone" dataKey="orders" stroke="#3b82f6" name="Total Orders" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current status of all orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Completed", value: 65 },
                            { name: "In Progress", value: 20 },
                            { name: "Pending", value: 10 },
                            { name: "Rejected", value: 5 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: "Completed", value: 65, color: "#10b981" },
                            { name: "In Progress", value: 20, color: "#3b82f6" },
                            { name: "Pending", value: 10, color: "#f59e0b" },
                            { name: "Rejected", value: 5, color: "#ef4444" },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Category Distribution</CardTitle>
                <CardDescription>Breakdown of products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {productCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Most popular products by sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "SSD 500GB", sales: 42 },
                        { name: "RAM 16GB", sales: 38 },
                        { name: "Intel i5", sales: 30 },
                        { name: "SSD 1TB", sales: 25 },
                        { name: "RAM 32GB", sales: 22 },
                      ]}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#3b82f6" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", users: 10 },
                        { month: "Feb", users: 15 },
                        { month: "Mar", users: 18 },
                        { month: "Apr", users: 25 },
                        { month: "May", users: 30 },
                        { month: "Jun", users: 35 },
                        { month: "Jul", users: 40 },
                        { month: "Aug", users: 42 },
                        { month: "Sep", users: 45 },
                        { month: "Oct", users: 48 },
                        { month: "Nov", users: 50 },
                        { month: "Dec", users: 55 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#3b82f6" activeDot={{ r: 8 }} name="Total Users" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Clients", value: 45 },
                          { name: "Managers", value: 3 },
                          { name: "Admins", value: 2 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "Clients", value: 45, color: "#10b981" },
                          { name: "Managers", value: 3, color: "#3b82f6" },
                          { name: "Admins", value: 2, color: "#ef4444" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
