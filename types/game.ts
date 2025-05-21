import type { ProvablyFairData } from "@/lib/provable-random"

export interface Prize {
  id: number
  name: string
  value: string // Prize description
  color: string
  probability: number
  icon: string
}

export interface UserProfile {
  id: string
  telegramId?: string
  username: string
  walletAddress?: string
  depositAddress?: string
  balance: number
  totalSpins: number
  paidSpins: number
  freeSpinsAvailable: number
  lastSpinDate?: Date
  winnings: number
  losses: number
}

export interface SpinResult {
  prize: Prize
  provablyFairData: ProvablyFairData
  timestamp: Date
  userId: string
}

export interface GameSettings {
  houseEdgePercent: number
  minDepositAmount: number
  withdrawalFee: number
  maintenanceMode: boolean
}
