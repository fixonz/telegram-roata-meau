// This is a simple in-memory database for demonstration
// In production, you would use a real database like MongoDB, PostgreSQL, etc.

import type { UserProfile } from "@/types/game"

// In-memory storage
const users: Record<string, UserProfile> = {}
const wallets: Record<string, { privateKey: string; mnemonic: string }> = {}
const prizes: Record<string, any[]> = {}
const deposits: Record<string, { amount: number; timestamp: Date; spins: number }[]> = {}

// User functions
export async function getUser(userId: string): Promise<UserProfile | null> {
  return users[userId] || null
}

export async function saveUser(user: UserProfile): Promise<UserProfile> {
  users[user.id] = user
  return user
}

// Wallet functions
export async function saveWallet(userId: string, privateKey: string, mnemonic: string): Promise<void> {
  wallets[userId] = { privateKey, mnemonic }
}

export async function getWallet(userId: string): Promise<{ privateKey: string; mnemonic: string } | null> {
  return wallets[userId] || null
}

// Prize functions
export async function savePrizes(prizeList: any[]): Promise<void> {
  prizes["main"] = prizeList
}

export async function getPrizes(): Promise<any[]> {
  return prizes["main"] || []
}

// Deposit functions
export async function recordDeposit(
  userId: string,
  amount: number,
  spins: number,
): Promise<{ amount: number; timestamp: Date; spins: number }> {
  const deposit = { amount, timestamp: new Date(), spins }

  if (!deposits[userId]) {
    deposits[userId] = []
  }

  deposits[userId].push(deposit)
  return deposit
}

export async function getDeposits(userId: string): Promise<{ amount: number; timestamp: Date; spins: number }[]> {
  return deposits[userId] || []
}

// Initialize with some default prizes
export async function initializeDefaultData(): Promise<void> {
  // Default prizes for each level if none exist
  if (!prizes["1"]) {
    await savePrizes([
      { id: 1, name: "JACKPOT", value: "Grand Prize", color: "#9C27B0", icon: "trophy", probability: 0.01 },
      { id: 2, name: "GOLD", value: "Gold Prize", color: "#E91E63", icon: "gift", probability: 0.02 },
      { id: 3, name: "SILVER", value: "Silver Prize", color: "#FF5722", icon: "gift", probability: 0.03 },
      { id: 4, name: "BRONZE", value: "Bronze Prize", color: "#FF9800", icon: "zap", probability: 0.05 },
      { id: 5, name: "RARE", value: "Rare Item", color: "#FFEB3B", icon: "sparkles", probability: 0.07 },
      { id: 6, name: "COMMON", value: "Common Item", color: "#4CAF50", icon: "sparkles", probability: 0.1 },
      { id: 7, name: "BASIC", value: "Basic Item", color: "#2196F3", icon: "gift", probability: 0.12 },
      { id: 8, name: "SMALL", value: "Small Prize", color: "#3F51B5", icon: "zap", probability: 0.15 },
      { id: 9, name: "BONUS", value: "Bonus Spin", color: "#673AB7", icon: "gift", probability: 0.05 },
      { id: 10, name: "FREE SPIN", value: "Free Spin", color: "#009688", icon: "zap", probability: 0.05 },
      { id: 11, name: "MISS", value: "No Prize", color: "#F44336", icon: "x", probability: 0.15 },
      { id: 12, name: "MISS", value: "No Prize", color: "#795548", icon: "x", probability: 0.2 },
    ])
  }
}
