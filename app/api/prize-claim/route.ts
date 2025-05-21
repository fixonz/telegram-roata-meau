import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This is a simplified example of a prize claim handler
// In a real implementation, you would store this in a database

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { userId, prizeName, prizeValue } = data

    if (!userId || !prizeName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Determine transaction type
    let type: "WIN" | "BONUS" | "LOSS" = "LOSS"
    if (prizeName === "BONUS" || prizeName === "FREE SPIN") {
      type = "BONUS"
    } else if (prizeName !== "No Prize") {
      type = "WIN"
    }

    // Parse value (LTC) if provided, else 0
    const amount = prizeValue ? parseFloat(prizeValue) : 0

    // Find user by telegramId or id
    let user = await prisma.user.findUnique({ where: { telegramId: userId } })
    if (!user) {
      const numericId = Number(userId)
      if (!isNaN(numericId)) {
        user = await prisma.user.findUnique({ where: { id: numericId } })
      }
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Record the transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        txid: null,
        amount,
        type,
        prizeName,
        prizeValue: prizeValue ? prizeValue.toString() : null,
      },
    })

    // Generate a unique claim code
    const claimCode = generateClaimCode()

    // In a real implementation, you would:
    // 1. Store the claim in your database
    // 2. Check if the user has already claimed a prize today
    // 3. Validate that the prize was actually won

    // For this example, we'll just return a success response with the claim code
    return NextResponse.json({
      success: true,
      claimCode,
      message: `Your prize "${prizeName}" has been registered. Show this code when claiming: ${claimCode}`,
    })
  } catch (error) {
    console.error("Error handling prize claim:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Generate a random alphanumeric claim code
function generateClaimCode(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
