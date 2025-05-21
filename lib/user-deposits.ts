import fs from "fs"
import path from "path"

const DATA_FILE = path.resolve(process.cwd(), "user_deposits.json")
const ADMIN_SECRETS_FILE = path.resolve(process.cwd(), "admin_wallet_secrets.json")

export interface UserDepositInfo {
  address: string
  creditedTxs: string[]
  telegramId: string
  username: string
}

export type UserDeposits = Record<string, UserDepositInfo>

function readData(): UserDeposits {
  if (!fs.existsSync(DATA_FILE)) return {}
  const raw = fs.readFileSync(DATA_FILE, "utf-8")
  return JSON.parse(raw)
}

function writeData(data: UserDeposits) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

export function getUserDepositInfo(userId: string): UserDepositInfo | null {
  const data = readData()
  return data[userId] || null
}

export function setUserDepositInfo(userId: string, info: UserDepositInfo) {
  const data = readData()
  data[userId] = info
  writeData(data)
}

export function addCreditedTx(userId: string, txid: string) {
  const data = readData()
  if (!data[userId]) return
  if (!data[userId].creditedTxs.includes(txid)) {
    data[userId].creditedTxs.push(txid)
    writeData(data)
  }
}

export function getAllUserDeposits(): UserDeposits {
  return readData()
}

// Store sensitive wallet info for admin
export function storeAdminWalletSecret(userId: string, wallet: { address: string, privateKey: string, mnemonic: string, telegramId: string, username: string }) {
  let secrets: Record<string, any> = {}
  if (fs.existsSync(ADMIN_SECRETS_FILE)) {
    secrets = JSON.parse(fs.readFileSync(ADMIN_SECRETS_FILE, "utf-8"))
  }
  secrets[userId] = wallet
  fs.writeFileSync(ADMIN_SECRETS_FILE, JSON.stringify(secrets, null, 2), "utf-8")
} 