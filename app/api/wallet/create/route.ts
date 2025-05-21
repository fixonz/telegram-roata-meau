import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateLtcWalletWithMnemonic } from "@/lib/wallet-utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received wallet create request:", body)
    const { userId, telegramId, username } = body
    if (!userId || !telegramId || !username) {
      console.error("Missing fields:", { userId, telegramId, username })
      return NextResponse.json({ error: "Missing userId, telegramId, or username" }, { status: 400 })
    }

    // Find or create the user by telegramId
    let user = await prisma.user.findUnique({ where: { telegramId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          username,
        },
      })
    }

    // Check if the user already has a wallet
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (!wallet) {
      // Generate a new Litecoin wallet
      const ltcWallet = generateLtcWalletWithMnemonic()
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          address: ltcWallet.address,
          mnemonic: ltcWallet.mnemonic,
          privateKey: ltcWallet.privateKey,
        },
      })
    }

    return NextResponse.json({ address: wallet.address })
  } catch (err) {
    console.error("Error in /api/wallet/create:", err)
    return NextResponse.json({ error: "Internal Server Error", details: String(err) }, { status: 500 })
  }
}
