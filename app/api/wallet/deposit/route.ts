import { NextResponse } from "next/server"
import { getUser, saveUser, recordDeposit } from "@/lib/db"
import { calculateSpinsForDeposit } from "@/lib/user-levels"

export async function POST(request: Request) {
  return NextResponse.json({
    error: "Manual deposits are disabled. Please send LTC to your deposit address. Your balance will be credited automatically after confirmation."
  }, { status: 403 })
}
