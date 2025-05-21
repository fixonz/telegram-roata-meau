import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAllLtcTransactions } from "@/lib/blockcypher"

export async function POST(request: Request) {
  const { userId } = await request.json()
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

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
  if (!wallet) {
    return NextResponse.json({ error: "No wallet found for user" }, { status: 404 })
  }

  // Fetch all transactions (confirmed and unconfirmed)
  const txs = await getAllLtcTransactions(wallet.address)

  // Get all credited deposit txids from the DB
  const creditedTxs = await prisma.transaction.findMany({
    where: { userId: user.id, type: "DEPOSIT" },
    select: { txid: true },
  })
  const creditedTxids = creditedTxs.map(t => t.txid)

  // Credit new confirmed deposits
  let credited = false
  for (const tx of txs) {
    if (tx.confirmations > 0 && !creditedTxids.includes(tx.txid)) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          txid: tx.txid,
          amount: tx.value,
          type: "DEPOSIT",
        },
      })
      credited = true
    }
  }

  // Calculate confirmed balance: sum all DEPOSIT, WIN, BONUS minus LOSS, WITHDRAWAL
  const allTxs = await prisma.transaction.findMany({ where: { userId: user.id } })
  const balance = allTxs.reduce((sum, t) => {
    if (["DEPOSIT", "WIN", "BONUS"].includes(t.type)) return sum + t.amount
    if (["LOSS", "WITHDRAWAL"].includes(t.type)) return sum - t.amount
    return sum
  }, 0)

  // Return all txs (confirmed and unconfirmed) and confirmed balance
  return NextResponse.json({
    balance,
    transactions: txs,
  })
} 