"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Wallet, ArrowUpRight, Check } from "lucide-react"
import { isValidAddress } from "@/lib/wallet-utils"
import QRCode from "react-qr-code"

interface WalletConnectProps {
  onConnect: (address: string) => void
  connected: boolean
  balance: number
  depositAddress: string
}

export function WalletConnect({ onConnect, connected, balance, depositAddress }: WalletConnectProps) {
  const [address, setAddress] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawAddress, setWithdrawAddress] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [copied, setCopied] = useState(false)
  const [generatingAddress, setGeneratingAddress] = useState(false)
  const [generatedAddress, setGeneratedAddress] = useState(depositAddress || "")

  // Handle manual wallet connection
  const handleConnect = () => {
    if (!address) {
      setError("Please enter a wallet address")
      return
    }

    if (!isValidAddress(address)) {
      setError("Invalid Ethereum address")
      return
    }

    setError("")
    onConnect(address)
  }

  // Handle WalletConnect
  const handleWalletConnect = async () => {
    try {
      // In a real implementation, this would use the WalletConnect SDK
      // For this demo, we'll simulate a successful connection
      setTimeout(() => {
        const mockAddress = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
        onConnect(mockAddress)
        setAddress(mockAddress)
      }, 1000)
    } catch (err) {
      setError("Failed to connect wallet")
    }
  }

  // Handle withdrawal
  const handleWithdraw = () => {
    const amount = Number.parseFloat(withdrawAmount)

    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (amount > balance) {
      setError("Insufficient balance")
      return
    }

    if (!withdrawAddress || !isValidAddress(withdrawAddress)) {
      setError("Please enter a valid withdrawal address")
      return
    }

    // In a real implementation, this would call a server endpoint to process the withdrawal
    setSuccess(
      `Withdrawal of ${amount} LTC to ${withdrawAddress.substring(0, 6)}...${withdrawAddress.substring(38)} initiated`,
    )
    setWithdrawAmount("")
    setWithdrawAddress("")
  }

  // Generate a deposit address
  const generateAddress = () => {
    setGeneratingAddress(true)

    // In a real implementation, this would call a server endpoint to generate an address
    setTimeout(() => {
      const mockAddress = "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE"
      setGeneratedAddress(mockAddress)
      setGeneratingAddress(false)
    }, 1500)
  }

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet
        </CardTitle>
        <CardDescription>Connect your wallet or generate a deposit address</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4">
            {!generatedAddress ? (
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="wallet-address">Your ETH Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="wallet-address"
                      placeholder="0x..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleConnect} disabled={connected}>
                      {connected ? "Connected" : "Connect"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-400">- OR -</p>
                  <Button variant="outline" className="w-full" onClick={handleWalletConnect} disabled={connected}>
                    Connect with WalletConnect
                  </Button>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-400">- OR -</p>
                  <Button variant="default" className="w-full" onClick={generateAddress} disabled={generatingAddress}>
                    {generatingAddress ? "Generating..." : "Generate Deposit Address"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg">
                  <QRCode value={`litecoin:${generatedAddress}`} size={180} level="H" />
                </div>

                <div className="space-y-2">
                  <Label>Deposit Address</Label>
                  <div className="flex items-center gap-2">
                    <Input value={generatedAddress} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedAddress)}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">Send ETH to this address to deposit funds to your account</p>
                </div>

                <Alert className="bg-yellow-900/30 border-yellow-800 text-yellow-200">
                  <AlertDescription className="text-sm">
                    Only send LTC to this address. Deposits typically take 10-30 minutes to be credited.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="withdraw-amount">Amount (ETH)</Label>
                <div className="flex gap-2">
                  <Input
                    id="withdraw-amount"
                    placeholder="0.0"
                    type="number"
                    step="0.001"
                    min="0.001"
                    max={balance.toString()}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setWithdrawAmount(balance.toString())}>
                    Max
                  </Button>
                </div>
                <p className="text-xs text-gray-400">Available: {balance.toFixed(4)} ETH</p>
              </div>

              <div className="flex flex-col space-y-2">
                <Label htmlFor="withdraw-address">Withdrawal Address</Label>
                <Input
                  id="withdraw-address"
                  placeholder="0x..."
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                />
              </div>

              <Button
                variant="default"
                className="w-full"
                onClick={handleWithdraw}
                disabled={
                  !withdrawAmount ||
                  !withdrawAddress ||
                  Number.parseFloat(withdrawAmount) <= 0 ||
                  Number.parseFloat(withdrawAmount) > balance
                }
              >
                Withdraw
              </Button>

              <p className="text-xs text-gray-400 text-center">Withdrawal fee: 0.0005 ETH</p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert className="mt-4 bg-red-900/30 border-red-800 text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 bg-green-900/30 border-green-800 text-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">Recent Transactions</span>
          <span className="text-xs text-gray-500">No recent transactions</span>
        </div>
        <Button variant="link" size="sm" className="text-blue-400">
          View All <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
