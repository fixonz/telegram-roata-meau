const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function sendTelegramMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set")
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
} 