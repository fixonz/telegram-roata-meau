"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

// Mock prize history data
const mockHistory = [
  {
    id: 1,
    username: "crypto_whale",
    prize: "0.5000 LTC",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    value: 0.5,
  },
  {
    id: 2,
    username: "lucky_spinner",
    prize: "0.0200 LTC",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    value: 0.02,
  },
  {
    id: 3,
    username: "eth_master",
    prize: "0.1000 LTC",
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    value: 0.1,
  },
  {
    id: 4,
    username: "crypto_player",
    prize: "0.0050 LTC",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    value: 0.005,
  },
]

export function PrizeHistory() {
  const [history] = useState(mockHistory)

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Wins
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-gray-800 pb-2">
              <div>
                <p className="font-medium">{item.username}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(item.timestamp)}</p>
              </div>
              <Badge
                variant={item.value >= 0.1 ? "destructive" : "default"}
                className={item.value >= 0.1 ? "bg-gradient-to-r from-yellow-600 to-red-600" : ""}
              >
                {item.prize}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
