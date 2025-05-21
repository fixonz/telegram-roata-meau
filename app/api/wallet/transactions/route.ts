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

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ transactions })
} 