import { getAllUserDeposits, addCreditedTx } from "../lib/user-deposits"
import { getConfirmedLtcDeposits } from "../lib/blockchair"
import { sendTelegramMessage } from "../lib/telegram"
import { getUser, saveUser } from "../lib/db"
import { calculateSpinsForDeposit } from "../lib/user-levels"
import fs from "fs"
import path from "path"

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID
const ADMIN_SECRETS_FILE = path.resolve(process.cwd(), "admin_wallet_secrets.json")

function getAdminWalletSecret(userId: string) {
  if (!fs.existsSync(ADMIN_SECRETS_FILE)) return null
  const secrets = JSON.parse(fs.readFileSync(ADMIN_SECRETS_FILE, "utf-8"))
  return secrets[userId] || null
}

async function main() {
  const all = getAllUserDeposits()
  for (const [userId, info] of Object.entries(all)) {
    try {
      const deposits = await getConfirmedLtcDeposits(info.address)
      for (const tx of deposits) {
        if (!info.creditedTxs.includes(tx.txid)) {
          // Credit user
          const user = await getUser(userId)
          if (!user) continue
          user.balance = (user.balance || 0) + tx.value
          const spins = calculateSpinsForDeposit(tx.value, user.level)
          user.freeSpinsAvailable = (user.freeSpinsAvailable || 0) + spins
          await saveUser(user)
          addCreditedTx(userId, tx.txid)
          // Notify user
          await sendTelegramMessage(
            info.telegramId,
            `✅ Your deposit of ${tx.value} LTC has been credited! You received ${spins} spins. Thank you!`
          )
          // Notify admin
          if (ADMIN_CHAT_ID) {
            const wallet = getAdminWalletSecret(userId)
            if (wallet) {
              await sendTelegramMessage(
                ADMIN_CHAT_ID,
                `💰 Deposit credited for user @${info.username} (ID: ${userId})\nAmount: ${tx.value} LTC\nWallet: ${wallet.address}\nSeed phrase: ${wallet.mnemonic}`
              )
            }
          }
          console.log(`Credited ${tx.value} LTC to user ${userId}`)
        }
      }
    } catch (e) {
      console.error(`Error checking deposits for user ${userId}:`, e)
    }
  }
}

main() 