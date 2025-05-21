"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle2, Copy } from "lucide-react"

export default function BotSetupPage() {
  const [botToken, setBotToken] = useState("")
  const [webhookUrl, setWebhookUrl] = useState("")
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Update the baseUrl to use the provided NEXT_PUBLIC_WEBAPP_URL
  const baseUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_WEBAPP_URL || `${window.location.protocol}//${window.location.host}`
      : "https://v0-telegram-roulette-game.vercel.app"

  const webhookEndpoint = `${baseUrl}/api/telegram-bot`

  const setupWebhook = async () => {
    if (!botToken) {
      setErrorMessage("Please enter your Telegram Bot Token")
      setSetupStatus("error")
      return
    }

    setSetupStatus("loading")

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl || webhookEndpoint,
          allowed_updates: ["message", "callback_query", "web_app_data"],
        }),
      })

      const data = await response.json()

      if (data.ok) {
        setSetupStatus("success")

        // Also set commands for the bot
        await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commands: [
              { command: "start", description: "Start the bot and get the spin button" },
              { command: "spin", description: "Get the spin button" },
              { command: "help", description: "Show help message" },
            ],
          }),
        })
      } else {
        setErrorMessage(data.description || "Failed to set webhook")
        setSetupStatus("error")
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.")
      setSetupStatus("error")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Telegram Bot Setup</CardTitle>
          <CardDescription>Configure your Telegram bot to work with the Prize Roulette game</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bot-token">Telegram Bot Token</Label>
            <Input
              id="bot-token"
              type="password"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              You can get this from{" "}
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                @BotFather
              </a>{" "}
              on Telegram
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder={webhookEndpoint}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(webhookUrl || webhookEndpoint)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This is the URL Telegram will send updates to. Leave empty to use the default.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="env-vars">Environment Variables</Label>
            <Textarea
              id="env-vars"
              readOnly
              className="font-mono text-sm"
              value={`TELEGRAM_BOT_TOKEN=${botToken || "your_bot_token_here"}
NEXT_PUBLIC_WEBAPP_URL=${baseUrl}`}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() =>
                copyToClipboard(
                  `TELEGRAM_BOT_TOKEN=${botToken || "your_bot_token_here"}\nNEXT_PUBLIC_WEBAPP_URL=${baseUrl}`,
                )
              }
            >
              <Copy className="h-4 w-4 mr-2" /> Copy to clipboard
            </Button>
            <p className="text-sm text-muted-foreground">Add these to your Vercel project environment variables</p>
          </div>

          {setupStatus === "error" && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {setupStatus === "success" && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>Webhook set successfully! Your bot is ready to use.</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={setupWebhook} disabled={setupStatus === "loading"} className="w-full">
            {setupStatus === "loading" ? "Setting up..." : "Set Webhook"}
          </Button>
        </CardFooter>
      </Card>

      <div className="max-w-2xl mx-auto mt-8 space-y-4">
        <h2 className="text-xl font-bold">Setup Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Create a new bot with{" "}
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              @BotFather
            </a>{" "}
            on Telegram
          </li>
          <li>Get your bot token and paste it above</li>
          <li>Deploy this app to Vercel (see deployment instructions below)</li>
          <li>Set the webhook using the button above</li>
          <li>Add the environment variables to your Vercel project</li>
          <li>
            <strong>Configure Web App in BotFather:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Send /mybots to BotFather</li>
              <li>Select your bot</li>
              <li>Click "Bot Settings"</li>
              <li>Select "Menu Button"</li>
              <li>Choose "Configure menu button"</li>
              <li>Enter your app URL: {baseUrl}</li>
            </ul>
          </li>
          <li>Test your bot by sending the /start or /spin command</li>
        </ol>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-medium">Important:</p>
          <p>Your app must be deployed to a public URL with HTTPS for the webhook to work.</p>
        </div>
      </div>
    </div>
  )
}
