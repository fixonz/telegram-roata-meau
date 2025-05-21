import { NextResponse } from "next/server"
import { savePrizes, getPrizes } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { prizes } = data

    if (!prizes || !Array.isArray(prizes)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate the prizes
    const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)
    if (Math.abs(totalProbability - 1) > 0.001) {
      return NextResponse.json({ error: "Total probability must be 1.0", totalProbability }, { status: 400 })
    }

    // Save prizes to database (no level)
    await savePrizes(prizes)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating prizes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  // No level parameter needed
  const prizes = await getPrizes()
  if (!prizes || prizes.length === 0) {
    return NextResponse.json({ error: "Prizes not found" }, { status: 404 })
  }
  return NextResponse.json({ prizes })
}
