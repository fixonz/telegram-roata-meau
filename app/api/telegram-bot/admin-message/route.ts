import { type NextRequest, NextResponse } from "next/server"

// This endpoint sends a message to the admin via the Telegram bot
export async function POST(request: NextRequest) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    if (!ADMIN_CHAT_ID) {
      console.warn("Admin chat ID not configured, logging message locally instead")
      const data = await request.json()
      console.log("Admin message:", data.message)
      return NextResponse.json({ success: true, warning: "Admin chat ID not configured, message logged locally" })
    }

    const data = await request.json()
    const { message } = data

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    try {
      // Send message to admin
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      })

      const result = await response.json()

      if (!result.ok) {
        console.error("Failed to send admin message:", result)
        // Continue execution even if sending fails
        return NextResponse.json({
          success: false,
          warning: "Failed to send admin message, but wallet was generated",
          error: result,
        })
      }

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error("Error sending admin message:", error)
      // Continue execution even if sending fails
      return NextResponse.json({
        success: false,
        warning: "Error sending admin message, but wallet was generated",
        error: String(error),
      })
    }
  } catch (error) {
    console.error("Error in admin message route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
