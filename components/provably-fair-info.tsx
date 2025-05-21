"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, X, RefreshCw, Shield } from "lucide-react"

interface ProvablyFairInfoProps {
  serverSeed: string
  clientSeed: string
  nonce: number
  onClose: () => void
}

export function ProvablyFairInfo({ serverSeed, clientSeed, nonce, onClose }: ProvablyFairInfoProps) {
  const [newClientSeed, setNewClientSeed] = useState(clientSeed)
  const [copied, setCopied] = useState<string | null>(null)

  // Copy text to clipboard
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Update client seed
  const updateClientSeed = () => {
    // In a real implementation, this would update the client seed in the backend
    alert("Client seed updated successfully!")
  }

  return (
    <Card className="mt-6 bg-gray-900/80 border-gray-800">
      <CardHeader className="relative pb-2">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Provably Fair System
        </CardTitle>
        <CardDescription>Verify the fairness of each spin with cryptographic proof</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Server Seed Hash (Current Round)</Label>
          <div className="flex gap-2">
            <Input
              value="87a589634b0a1a8c9d5c743593b0195c58635921b9d8e4b7568f71d547e07c9a"
              readOnly
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                copyToClipboard("87a589634b0a1a8c9d5c743593b0195c58635921b9d8e4b7568f71d547e07c9a", "serverHash")
              }
            >
              {copied === "serverHash" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            The server seed is hashed and shown before the spin. After the spin, the original server seed is revealed.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Previous Server Seed (Revealed)</Label>
          <div className="flex gap-2">
            <Input value={serverSeed} readOnly className="font-mono text-xs" />
            <Button variant="outline" size="icon" onClick={() => copyToClipboard(serverSeed, "serverSeed")}>
              {copied === "serverSeed" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Client Seed</Label>
          <div className="flex gap-2">
            <Input
              value={newClientSeed}
              onChange={(e) => setNewClientSeed(e.target.value)}
              className="font-mono text-xs"
            />
            <Button variant="outline" onClick={updateClientSeed}>
              Update
            </Button>
          </div>
          <p className="text-xs text-gray-400">You can change your client seed at any time for added randomness.</p>
        </div>

        <div className="space-y-2">
          <Label>Current Nonce</Label>
          <Input value={nonce.toString()} readOnly className="font-mono" />
          <p className="text-xs text-gray-400">The nonce increases by 1 with each spin.</p>
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <p className="text-sm">
          How it works: We combine the server seed, client seed, and nonce to generate a provably fair random number
          using SHA-256.
        </p>
        <Button
          variant="link"
          className="text-blue-400 p-0 h-auto"
          onClick={() => window.open("https://en.wikipedia.org/wiki/Provably_fair", "_blank")}
        >
          Learn more about provably fair algorithms
        </Button>
      </CardFooter>
    </Card>
  )
}
