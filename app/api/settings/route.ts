import { NextResponse } from "next/server"

// In a real implementation, this would be stored in a database
let gameSettings = {
  houseEdgePercent: 35,
  minDepositAmount: 0.01,
  withdrawalFee: 0.001,
  maintenanceMode: false,
}

export async function GET() {
  return NextResponse.json({ settings: gameSettings })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (
      typeof data.houseEdgePercent !== "number" ||
      typeof data.minDepositAmount !== "number" ||
      typeof data.withdrawalFee !== "number" ||
      typeof data.maintenanceMode !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 })
    }

    // Update settings
    gameSettings = {
      houseEdgePercent: data.houseEdgePercent,
      minDepositAmount: data.minDepositAmount,
      withdrawalFee: data.withdrawalFee,
      maintenanceMode: data.maintenanceMode,
    }

    return NextResponse.json({ success: true, settings: gameSettings })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
