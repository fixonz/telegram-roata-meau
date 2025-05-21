import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This is a simplified example of admin authentication
// In a real implementation, you would use a proper authentication system

const ADMIN_USERNAME = "admin"
const ADMIN_PASSWORD = "password123" // In a real app, use hashed passwords

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { username, password } = data

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set a cookie to authenticate the admin
      cookies().set("admin_token", "admin_session_token_would_be_here", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Error during admin login:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  // Check if the admin is logged in
  const token = cookies().get("admin_token")

  if (token) {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json({ authenticated: false })
}
