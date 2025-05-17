import { NextResponse } from "next/server"

// This is a mock API route for demonstration purposes
// In a real application, this would connect to your Django backend

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, phone, password } = body

    // In a real app, this would make a request to your Django backend
    // For demo purposes, we'll simulate a successful registration

    // Validate required fields
    if (!username || !email || !phone || !password) {
      return NextResponse.json({ detail: "All fields are required" }, { status: 400 })
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ detail: "Invalid email format" }, { status: 400 })
    }

    // Validate phone format (basic validation for demo)
    const phoneRegex = /^\+[0-9]{12,15}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ detail: "Invalid phone format. Use format: +998901234567" }, { status: 400 })
    }

    // In a real app, you would check if the user already exists
    // and hash the password before saving to the database

    // Return successful response with mock user data
    return NextResponse.json(
      {
        id: 999,
        username,
        email,
        phone,
        role: "user",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 })
  }
}
