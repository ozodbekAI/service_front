import { NextResponse } from "next/server"

// This is a mock API route for demonstration purposes
// In a real application, this would connect to your Django backend

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // In a real app, this would make a request to your Django backend
    // For demo purposes, we'll simulate a successful login with mock data

    // Validate credentials (very basic validation for demo)
    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 })
    }

    // Mock users for demonstration
    const mockUsers = [
      {
        id: 1,
        username: "admin_user",
        email: "admin@example.com",
        phone: "+998901234567",
        role: "admin",
      },
      {
        id: 2,
        username: "manager_user",
        email: "manager@example.com",
        phone: "+998901234568",
        role: "manager",
      },
      {
        id: 3,
        username: "regular_user",
        email: "user@example.com",
        phone: "+998901234569",
        role: "user",
      },
    ]

    // Find user by email
    const user = mockUsers.find((u) => u.email === email)

    // Check if user exists and password is correct
    // In a real app, you would hash and compare passwords
    if (!user || password !== "password") {
      return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 })
    }

    // Generate mock tokens
    const mockTokens = {
      refresh: "mock_refresh_token",
      access: "mock_access_token",
    }

    // Return successful response
    return NextResponse.json({
      user,
      refresh: mockTokens.refresh,
      access: mockTokens.access,
      status: "Success",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
