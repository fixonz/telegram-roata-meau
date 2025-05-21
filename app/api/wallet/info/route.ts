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
    // Fallback: try by numeric id
    const numericId = Number(userId)
    if (!isNaN(numericId)) {
      user = await prisma.user.findUnique({ where: { id: numericId } })
    }
  }
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
  if (!wallet) {
    return NextResponse.json({ error: "No wallet found for user" }, { status: 404 })
  }

  // Calculate confirmed balance: sum all DEPOSIT, WIN, BONUS minus LOSS, WITHDRAWAL
  const allTxs = await prisma.transaction.findMany({ where: { userId: user.id } })
  const balance = allTxs.reduce((sum: number, t: any) => {
    if (["DEPOSIT", "WIN", "BONUS"].includes(t.type)) return sum + t.amount
    if (["LOSS", "WITHDRAWAL"].includes(t.type)) return sum - t.amount
    return sum
  }, 0)

  return NextResponse.json({
    address: wallet.address,
    balance,
  })
} 