"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import QRCode from "react-qr-code"
import { Copy, Check, RefreshCw } from "lucide-react"

interface WalletSectionProps {
  userId: string
  username?: string
}

export function WalletSection({ userId, username }: WalletSectionProps) {
  console.log("WalletSection loaded with userId:", userId, "username:", username)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState(0)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])

  // Fetch wallet info and ensure wallet exists
  const fetchWallet = async () => {
    if (!userId) {
      setError("User ID is missing! Cannot fetch wallet info.")
      console.error("User ID is missing! Cannot fetch wallet info.")
      return
    }
    setLoading(true)
    setError("")
    try {
      console.log("Calling /api/wallet/info with userId:", userId)
      const res = await fetch(`/api/wallet/info?userId=${userId}`)
      let data
      try {
        data = await res.json()
      } catch (e) {
        setError("Server error: invalid response from /api/wallet/info")
        setLoading(false)
        return
      }
      if (res.status === 404) {
        setError("Wallet not found. Please contact support.")
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError(data.error || "Failed to fetch wallet info")
        setLoading(false)
        return
      }
      setAddress(data.address)
      setBalance(data.balance)
      // Always check deposit after fetching wallet info
      await checkDeposit()
      // Fetch transactions
      await fetchTransactions()
    } catch (e: any) {
      setError(e.message || "Failed to fetch wallet info")
      console.error("WalletSection error:", e)
    } finally {
      setLoading(false)
    }
  }

  // Fetch transaction history
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`/api/wallet/transactions?userId=${userId}`)
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const data = await res.json()
      setTransactions(data.transactions || [])
    } catch (e) {
      console.error("Failed to fetch transactions", e)
    }
  }

  useEffect(() => {
    if (userId) fetchWallet()
  }, [userId])

  // Manual check for new deposits
  const checkDeposit = async () => {
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/api/wallet/check-deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error("Failed to check deposit")
      const data = await res.json()
      setBalance(data.balance)
      setSuccess("Statusul depozitului a fost actualizat!")
    } catch (e: any) {
      setError(e.message || "Failed to check deposit")
    } finally {
      setLoading(false)
      setTimeout(() => setSuccess(""), 2000)
    }
  }

  const copyToClipboard = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 w-full max-w-md mx-auto mb-6">
      <CardHeader>
        <CardTitle>Portofel LTC</CardTitle>
        <CardDescription>Adresa ta de depozit și soldul</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <Label>Nume utilizator</Label>
          <div className="font-mono text-sm text-blue-300">{username || "-"}</div>
          <Label>User ID</Label>
          <div className="font-mono text-sm text-blue-300">{userId}</div>
        </div>
        {address && (
          <div className="flex flex-col items-center space-y-2 mt-4">
            <QRCode value={`litecoin:${address}`} size={180} level="H" />
            <Label>Adresă portofel</Label>
            <div className="flex items-center gap-2">
              <Input value={address} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400">Trimite LTC la această adresă pentru a-ți alimenta contul.</p>
          </div>
        )}
        <div className="flex flex-col items-center mt-4">
          <Label>Sold</Label>
          <div className="text-2xl font-bold text-green-400">{balance.toFixed(4)} LTC</div>
        </div>
        <Button variant="default" className="w-full mt-4" onClick={checkDeposit} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
          Verifică Depozitul
        </Button>
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
        <div className="flex flex-col items-center mt-8 w-full">
          <Label className="mb-2">Istoric tranzacții</Label>
          <div className="w-full max-h-64 overflow-y-auto bg-gray-800 rounded-lg p-2">
            {transactions.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">Nicio tranzacție înregistrată încă.</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-1 px-2">Tip</th>
                    <th className="py-1 px-2">Premiu</th>
                    <th className="py-1 px-2">Suma</th>
                    <th className="py-1 px-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-gray-700 last:border-b-0">
                      <td className="py-1 px-2 font-bold text-blue-300">{tx.type}</td>
                      <td className="py-1 px-2">{tx.prizeName || '-'}</td>
                      <td className="py-1 px-2">{Number(tx.amount).toFixed(4)} LTC</td>
                      <td className="py-1 px-2">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-gray-400">Depozitele sunt creditate după confirmarea completă pe blockchain.</p>
      </CardFooter>
    </Card>
  )
} 