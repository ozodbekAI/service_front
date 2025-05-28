"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  username: string
  email: string
  phone: string
  role: "client" | "manager" | "admin"
  is_legal: boolean
  profile_picture?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
  setUser: (user: User | null) => void;
}

interface RegisterData {
  username: string
  email: string
  phone: string
  password: string
  is_legal: boolean; // Add this line
  companyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        // In a real app, this would be an API call to verify the token
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      // For demo purposes, we'll simulate a successful login
      const response = await fetch("https://pc.ustaxona.bazarchi.software/api/v1/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Login failed")
      }

      const data = await response.json()

      // Store user data and tokens
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("access_token", data.access)
      localStorage.setItem("refresh_token", data.refresh)

      setUser(data.user)
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call
      const response = await fetch("https://pc.ustaxona.bazarchi.software/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Registration failed")
      }

      // Registration successful
      return await response.json()
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Clear stored data
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setUser(null)

    // In a real app, you might also want to invalidate the token on the server
    window.location.href = "/login"
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading, setUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
