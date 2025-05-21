"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash, Plus, Save, RefreshCw, Info } from "lucide-react"
import type { Prize } from "@/types/game"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock initial prizes for each level
const initialPrizes: Prize[] = [
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
]

// Emoji options for prizes
const emojiOptions = [
  { value: "💎", label: "Diamond" },
  { value: "🏆", label: "Trophy" },
  { value: "🥇", label: "Gold Medal" },
  { value: "🪙", label: "Coin" },
  { value: "🧊", label: "Ice Cube" },
  { value: "🍀", label: "Clover" },
  { value: "⭐", label: "Star" },
  { value: "☃️", label: "Snowman" },
  { value: "🎁", label: "Gift" },
  { value: "🎯", label: "Target" },
  { value: "🚫", label: "Stop Sign" },
  { value: "⛔", label: "No Entry" },
]

export default function AdminPage() {
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedEmojis, setSelectedEmojis] = useState<Record<number, string>>({})
  const [activeTab, setActiveTab] = useState("prizes")
  const [gameSettings, setGameSettings] = useState({
    houseEdgePercent: 35,
    minDepositAmount: 0.01,
    withdrawalFee: 0.001,
    maintenanceMode: false,
  })

  // Add a new prize
  const addPrize = () => {
    const newPrize: Prize = {
      id: Math.max(0, ...prizes.map((p) => p.id)) + 1,
      name: "New Prize",
      value: "Prize Item",
      color: "#607D8B",
      icon: "gift",
      probability: 0.05,
    }
    setPrizes((prev) => [...prev, newPrize])
  }

  // Remove a prize
  const removePrize = (id: number) => {
    setPrizes((prev) => prev.filter((p) => p.id !== id))
  }

  // Update a prize
  const updatePrize = (id: number, field: keyof Prize, value: any) => {
    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  // Save changes
  const saveChanges = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prizes }),
      })
      if (!response.ok) throw new Error("Failed to save prizes")
      // Save game settings
      const settingsResponse = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameSettings),
      })
      if (!settingsResponse.ok) throw new Error("Failed to save game settings")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error saving:", error)
      alert("Failed to save changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Calculate total probability
  const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0)
  const probabilityError = Math.abs(totalProbability - 1) > 0.001

  // Get prize emoji
  const getPrizeEmoji = (prize: Prize) => {
    if (selectedEmojis[prize.id]) {
      return selectedEmojis[prize.id]
    }

    if (prize.value === "No Prize" && prize.name.includes("MISS")) {
      return "🚫"
    }
    if (prize.name.includes("FREE SPIN")) {
      return "🎯"
    }
    if (prize.name.includes("BONUS")) {
      return "🎁"
    }

    // For value prizes, use different emojis based on name
    if (prize.name.includes("JACKPOT")) return "💎" // Diamond
    if (prize.name.includes("GOLD")) return "🏆" // Trophy
    if (prize.name.includes("SILVER")) return "🥇" // Gold medal
    if (prize.name.includes("BRONZE")) return "🪙" // Coin
    if (prize.name.includes("RARE")) return "🧊" // Ice cube
    if (prize.name.includes("COMMON")) return "🍀" // Clover
    if (prize.name.includes("BASIC")) return "⭐" // Star
    if (prize.name.includes("SMALL")) return "☃️" // Snowman

    return "🪙" // Default coin
  }

  // Update game settings
  const updateGameSettings = (field: string, value: any) => {
    setGameSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Tabs defaultValue="prizes" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4 w-full max-w-md mx-auto">
          <TabsTrigger value="prizes">Prize Configuration</TabsTrigger>
          <TabsTrigger value="settings">Game Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="prizes">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Prize Wheel Admin</CardTitle>
              <CardDescription>Configure prizes for each level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Prizes</h3>
                    <Button variant="outline" size="sm" onClick={addPrize}>
                      <Plus className="h-4 w-4 mr-2" /> Add Prize
                    </Button>
                  </div>

                  <Alert className="bg-blue-900/30 border-blue-800 text-blue-200">
                    <Info className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      <p className="text-sm">
                        <strong>Prize Rarity Guide:</strong> Set probabilities based on prize value. Rare prizes
                        (0.01-0.05) should have lower probabilities, common prizes (0.1-0.2) higher probabilities.
                      </p>
                    </AlertDescription>
                  </Alert>

                  {probabilityError && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
                      <p className="font-medium">Total probability: {totalProbability.toFixed(2)}</p>
                      <p className="text-sm">The total probability should be exactly 1.0</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {prizes.map((prize) => (
                      <div key={prize.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-1 flex justify-center">
                          <div className="text-2xl">{getPrizeEmoji(prize)}</div>
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`prize-name-${prize.id}`} className="sr-only">
                            Prize Name
                          </Label>
                          <Input
                            id={`prize-name-${prize.id}`}
                            value={prize.name}
                            onChange={(e) => updatePrize(prize.id, "name", e.target.value)}
                            placeholder="Prize Name"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`prize-value-${prize.id}`} className="sr-only">
                            Value
                          </Label>
                          <Input
                            id={`prize-value-${prize.id}`}
                            value={prize.value}
                            onChange={(e) => updatePrize(prize.id, "value", e.target.value)}
                            placeholder="Prize Description"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`prize-emoji-${prize.id}`} className="sr-only">
                            Emoji
                          </Label>
                          <Select
                            value={selectedEmojis[prize.id] || getPrizeEmoji(prize)}
                            onValueChange={(value) => setSelectedEmojis({ ...selectedEmojis, [prize.id]: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Emoji" />
                            </SelectTrigger>
                            <SelectContent>
                              {emojiOptions.map((emoji) => (
                                <SelectItem key={emoji.value} value={emoji.value}>
                                  <div className="flex items-center">
                                    <span className="mr-2">{emoji.value}</span>
                                    <span>{emoji.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`prize-color-${prize.id}`} className="sr-only">
                            Color
                          </Label>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded-full border border-gray-300"
                              style={{ backgroundColor: prize.color }}
                            />
                            <Input
                              id={`prize-color-${prize.id}`}
                              value={prize.color}
                              onChange={(e) => updatePrize(prize.id, "color", e.target.value)}
                              placeholder="#RRGGBB"
                              className="font-mono"
                            />
                          </div>
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor={`prize-probability-${prize.id}`} className="sr-only">
                            Probability
                          </Label>
                          <Input
                            id={`prize-probability-${prize.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={prize.probability}
                            onChange={(e) =>
                              updatePrize(prize.id, "probability", Number.parseFloat(e.target.value) || 0)
                            }
                            placeholder="Probability"
                          />
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePrize(prize.id)}
                            disabled={prizes.length <= 1}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setPrizes(initialPrizes)}>
                Reset to Default
              </Button>
              <Button onClick={saveChanges} disabled={saving || probabilityError}>
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-8 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="bg-purple-900 p-6 rounded-lg">
              <div className="flex justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  {/* Golden outer ring with shadow effect */}
                  <div
                    className="absolute inset-0 rounded-full border-[16px] border-yellow-500 bg-blue-900"
                    style={{
                      boxShadow: "0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {/* Black inner ring */}
                    <div className="absolute inset-[2px] rounded-full border-[4px] border-black"></div>
                  </div>

                  {/* Wheel segments */}
                  <div className="absolute inset-[24px] rounded-full overflow-hidden">
                    {prizes.map((prize, index) => {
                      const segmentAngle = 360 / prizes.length
                      const startAngle = index * segmentAngle

                      return (
                        <div
                          key={index}
                          className="absolute top-0 left-0 w-1/2 h-1/2 origin-bottom-right"
                          style={{
                            transform: `rotate(${startAngle}deg)`,
                            clipPath: `polygon(0 0, 100% 0, 100% 100%)`,
                          }}
                        >
                          <div
                            className="absolute inset-0"
                            style={{
                              backgroundColor: prize.color,
                              transformOrigin: "bottom right",
                              boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            {/* Prize text - rotated to follow the segment */}
                            <div
                              className="absolute"
                              style={{
                                top: "25%",
                                left: "40%",
                                transform: `rotate(${90 + segmentAngle / 2}deg)`,
                                transformOrigin: "left bottom",
                              }}
                            >
                              <span
                                className="text-yellow-300 font-bold text-lg"
                                style={{
                                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {`${selectedEmojis[prize.id] || getPrizeEmoji(prize)} ${prize.name}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Center circle */}
                    <div
                      className="absolute top-1/2 left-1/2 w-1/3 h-1/3 rounded-full bg-red-700 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-4 border-yellow-500"
                      style={{
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 5px rgba(0, 0, 0, 0.5)",
                        background: "radial-gradient(circle, #b91c1c 0%, #7f1d1d 100%)",
                      }}
                    >
                      <span
                        className="text-yellow-400 font-bold text-xl"
                        style={{ textShadow: "0 2px 2px rgba(0, 0, 0, 0.5)" }}
                      >
                        SPIN
                      </span>
                    </div>
                  </div>

                  {/* Pointer - positioned at the top */}
                  <div
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))" }}
                  >
                    <div
                      className="w-12 h-12"
                      style={{
                        clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
                        background: "linear-gradient(to bottom, #f59e0b 0%, #b45309 100%)",
                      }}
                    >
                      <div
                        className="absolute top-1 left-1/2 transform -translate-x-1/2 w-10 h-10"
                        style={{
                          clipPath: "polygon(50% 10%, 90% 90%, 10% 90%)",
                          background: "linear-gradient(to bottom, #d97706 0%, #92400e 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure global game settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="house-edge">House Edge (%)</Label>
                <Input
                  id="house-edge"
                  type="number"
                  min="1"
                  max="99"
                  value={gameSettings.houseEdgePercent}
                  onChange={(e) => updateGameSettings("houseEdgePercent", Number(e.target.value))}
                />
                <p className="text-sm text-gray-400">
                  The house edge determines the game's profitability. A 35% house edge means players get back 65% of
                  their bets on average.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="min-deposit">Minimum Deposit (LTC)</Label>
                <Input
                  id="min-deposit"
                  type="number"
                  min="0.001"
                  step="0.001"
                  value={gameSettings.minDepositAmount}
                  onChange={(e) => updateGameSettings("minDepositAmount", Number(e.target.value))}
                />
                <p className="text-sm text-gray-400">The minimum amount a user can deposit to receive spins.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawal-fee">Withdrawal Fee (LTC)</Label>
                <Input
                  id="withdrawal-fee"
                  type="number"
                  min="0.0001"
                  step="0.0001"
                  value={gameSettings.withdrawalFee}
                  onChange={(e) => updateGameSettings("withdrawalFee", Number(e.target.value))}
                />
                <p className="text-sm text-gray-400">Fee charged for processing withdrawals.</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="maintenance-mode"
                  checked={gameSettings.maintenanceMode}
                  onChange={(e) => updateGameSettings("maintenanceMode", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              </div>
              <p className="text-sm text-gray-400">When enabled, the game will be unavailable to users.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={saveChanges} disabled={saving} className="w-full">
                {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
