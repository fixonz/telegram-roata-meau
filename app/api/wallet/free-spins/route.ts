import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  // Try to find the user by telegramId or id
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

  // Count BONUS transactions (including FREE SPIN)
  const bonusCount = await prisma.transaction.count({
    where: { userId: user.id, type: "BONUS" },
  })
  // Count spins consumed using free spins (spins where type is WIN or LOSS and a free spin was used)
  // For now, assume every BONUS is a free spin, and every spin consumes one if available
  // So, freeSpinsAvailable = bonusCount - (total spins - paid spins)
  // But since we don't track which spins used a free spin, just return bonusCount for now

  return NextResponse.json({ freeSpinsAvailable: bonusCount })
} 