import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// This is a simplified example of a Telegram bot webhook handler
export async function POST(request: NextRequest) {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ error: "Bot token not configured" }, { status: 500 })
    }

    const data = await request.json()

    // Handle incoming messages from Telegram
    if (data.message) {
      const chatId = data.message.chat.id
      const messageText = data.message.text
      const userId = data.message.from.id.toString()
      const username = data.message.from.username || `user${data.message.from.id}`

      // Handle /start command
      if (messageText === "/start") {
        const webAppUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || "https://v0-telegram-roulette-game.vercel.app"
        const welcomeText = `👋 Bun venit la Roata lui Miau!\n\nID-ul tău: ${userId}\n\n🎰 Pacanele si droguri? De cand asteptai asta. Hai sa bagi o gheara!  🐈‍⬛\n💸 Adaugă LTC în portofelul tău iar fiecare rotire iti poate aduce ceva in farfurie! 🍽\n\n🛍 Toate produsele Miau aici @restauranterobot\n🛒 Pentru comenzi bulk @mrykane1`;
        console.log("[TELEGRAM BOT] /start received", { userId, username })
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "Vezi adresa portofel", callback_data: "show_wallet_address" },
                  { text: "Deschide aplicația", web_app: { url: webAppUrl } },
                ],
              ],
            },
          }),
        })

        // Upsert user in DB
        const user = await prisma.user.upsert({
          where: { telegramId: userId },
          update: { username },
          create: { telegramId: userId, username },
        });
        console.log("[TELEGRAM BOT] User upserted", { user });

        // Always check and create wallet if not exists
        let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
        if (!wallet) {
          const { generateLtcWalletWithMnemonic } = await import("@/lib/wallet-utils");
          const ltcWallet = generateLtcWalletWithMnemonic();
          wallet = await prisma.wallet.create({
            data: {
              userId: user.id,
              address: ltcWallet.address,
              mnemonic: ltcWallet.mnemonic,
              privateKey: ltcWallet.privateKey,
            },
          });
          console.log("[TELEGRAM BOT] Wallet created", { address: wallet.address, mnemonic: wallet.mnemonic });
        } else {
          console.log("[TELEGRAM BOT] Wallet already exists", { address: wallet.address });
        }
      }

      // Handle /help command
      else if (messageText === "/help") {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Available commands:\n/start - Start the bot and get the spin button\n/spin - Get the spin button\n/help - Show this help message",
          }),
        })
      }

      // Handle /addspin command (admin only)
      if (messageText && messageText.startsWith("/addspin")) {
        // Support multiple admin IDs from .env (comma-separated)
        const ADMIN_TELEGRAM_IDS = (process.env.ADMIN_TELEGRAM_ID || "").split(",").map(id => id.trim()).filter(Boolean);
        if (!ADMIN_TELEGRAM_IDS.includes(userId)) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "You are not authorized to use this command.",
            }),
          })
          return NextResponse.json({ ok: true })
        }
        const [, targetUsername, countStr] = messageText.split(" ");
        const count = parseInt(countStr, 10) || 1;
        if (!targetUsername) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Usage: /addspin <username> <count>",
            }),
          })
          return NextResponse.json({ ok: true })
        }
        // Find user by username
        const user = await prisma.user.findUnique({ where: { username: targetUsername } });
        if (!user) {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `User @${targetUsername} not found.`,
            }),
          })
          return NextResponse.json({ ok: true })
        }
        // Add BONUS transactions
        for (let i = 0; i < count; i++) {
          await prisma.transaction.create({
            data: {
              userId: user.id,
              type: "BONUS",
              amount: 0,
              prizeName: "BONUS",
              prizeValue: "Admin granted",
              txid: null,
            },
          });
        }
        // Send confirmation to admin
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `Added ${count} free spin(s) to @${targetUsername}.`,
          }),
        })
        // Optionally notify the user
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: user.telegramId,
            text: `Ai primit ${count} free spin${count > 1 ? 's' : ''} de la admin!`,
          }),
        })
        return NextResponse.json({ ok: true })
      }

      // Handle unknown commands
      else if (messageText) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: "Sorry, I don't understand that command. Use /help to see available commands.",
          }),
        })
      }
    }

    // Handle callback queries (button presses)
    if (data.callback_query) {
      const chatId = data.callback_query.message.chat.id
      const userId = data.callback_query.from.id.toString()
      const callbackData = data.callback_query.data

      if (callbackData === "show_wallet_address") {
        // Fetch or create wallet address from DB
        let user = await prisma.user.findUnique({ where: { telegramId: userId } })
        let address = null
        if (user) {
          let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
          if (!wallet) {
            const { generateLtcWalletWithMnemonic } = await import("@/lib/wallet-utils");
            const ltcWallet = generateLtcWalletWithMnemonic();
            wallet = await prisma.wallet.create({
              data: {
                userId: user.id,
                address: ltcWallet.address,
                mnemonic: ltcWallet.mnemonic,
                privateKey: ltcWallet.privateKey,
              },
            });
            console.log("[TELEGRAM BOT] Wallet created via button", { address: wallet.address, mnemonic: wallet.mnemonic });
          } else {
            console.log("[TELEGRAM BOT] Wallet already exists via button", { address: wallet.address });
          }
          address = wallet.address;
        }
        if (address) {
          // Generate QR code link (using a public QR code generator)
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=litecoin:${address}`
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              photo: qrUrl,
              caption: `Adresa ta LTC:\n<code>${address}</code>\n\nTrimite LTC la această adresă pentru a-ți alimenta contul.`,
              parse_mode: "HTML",
            }),
          })
        } else {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Nu am găsit o adresă de portofel pentru acest cont. Te rugăm să încerci din nou sau să contactezi suportul.",
            }),
          })
        }
      }
    }

    // Handle web app data
    if (data.web_app_data) {
      const chatId = data.web_app_data.user.id
      const webAppData = JSON.parse(data.web_app_data.data)

      // Send a message with the prize won
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎉 Felicitări! Ai câștigat: ${webAppData.prize}`,
          parse_mode: "HTML",
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error handling Telegram webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
