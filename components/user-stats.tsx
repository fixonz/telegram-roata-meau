"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UserProfile } from "@/types/game"
import { levels, spinsForNextLevel } from "@/lib/user-levels"
import { Zap, Trophy } from "lucide-react"

interface UserStatsProps {
  user: UserProfile
}

export function UserStats({ user }: UserStatsProps) {
  // Calculate win rate
  const totalBets = user.winnings + user.losses
  const winRate = totalBets > 0 ? (user.winnings / totalBets) * 100 : 0

  // Calculate progress to next level
  const currentLevelIndex = levels.findIndex((level) => level.id === user.level.id)
  const nextLevel = currentLevelIndex < levels.length - 1 ? levels[currentLevelIndex + 1] : null
  const progress = nextLevel
    ? ((user.totalSpins - user.level.minSpins) / (nextLevel.minSpins - user.level.minSpins)) * 100
    : 100

  return (
    <div className="space-y-4 mb-6">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Spins</p>
              <p className="text-2xl font-bold">{user.totalSpins}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Won</p>
              <p className="text-2xl font-bold text-green-500">{user.winnings.toFixed(4)} LTC</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-red-500">{user.losses.toFixed(4)} LTC</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Level {user.level.id}: {user.level.name}
              </span>
              {nextLevel && (
                <span>
                  Level {nextLevel.id}: {nextLevel.name}
                </span>
              )}
            </div>
            <Progress value={progress} className="h-2" />
            {nextLevel && (
              <p className="text-xs text-gray-400 text-center">
                {spinsForNextLevel(user.totalSpins)} more spins to reach Level {nextLevel.id}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bonuses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Daily Free Spin</p>
                <p className="text-sm text-gray-400">One free spin every 24 hours</p>
              </div>
              <p className="text-sm">
                {user.lastSpinDate && new Date().getTime() - new Date(user.lastSpinDate).getTime() > 24 * 60 * 60 * 1000
                  ? "Available"
                  : "Used"}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Volume Bonus</p>
                <p className="text-sm text-gray-400">Get 1 free spin for every 5 paid spins</p>
              </div>
              <p className="text-sm">{user.paidSpins % 5} / 5</p>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Level Multiplier</p>
                <p className="text-sm text-gray-400">Higher levels get better prizes</p>
              </div>
              <p className="text-sm font-medium">{user.level.bonusMultiplier}x</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
