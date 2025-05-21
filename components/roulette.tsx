"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Prize, UserProfile } from "@/types/game"
import { FancyWheel } from "@/components/fancy-wheel"
import { PrizeLegend } from "@/components/prize-legend"
import { RulesSection } from "@/components/rules-section"
import { WalletSection } from "@/components/wallet-section"

// Add this at the top of the file to fix linter errors for window.Telegram
declare global {
  interface Window {
    Telegram?: any;
  }
}

export function Roulette() {
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [telegramUser, setTelegramUser] = useState<{ id?: string; username?: string }>({})
  const [user, setUser] = useState<UserProfile>({
    id: "",
    username: "",
    balance: 0, // Start with 0 balance
    totalSpins: 0,
    paidSpins: 0,
    freeSpinsAvailable: 0, // Start with 0 free spins
    winnings: 0,
    losses: 0,
  })
  const [activeTab, setActiveTab] = useState("wheel")
  const [winner, setWinner] = useState<Prize | null>(null)
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null)

  useEffect(() => {
    // Wait a tick for Telegram to inject the object
    const timer = setTimeout(() => {
      if (
        typeof window !== "undefined" &&
        window.Telegram &&
        window.Telegram.WebApp &&
        window.Telegram.WebApp.initDataUnsafe?.user
      ) {
        setIsTelegram(true);
      } else {
        setIsTelegram(false);
      }
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Debug: log Telegram WebApp context
    // @ts-ignore
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      // @ts-ignore
      console.log("Telegram WebApp context:", window.Telegram.WebApp.initDataUnsafe);
    } else {
      console.log("Not in Telegram WebApp context");
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe?.user
    ) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      console.log("[Roulette] Using Telegram user context:", tgUser);
      setUser((prevUser) => ({
        ...prevUser,
        id: tgUser.id.toString(),
        username: tgUser.username || `user${tgUser.id}`,
      }));
      setTelegramUser({
        id: tgUser.id.toString(),
        username: tgUser.username || `user${tgUser.id}`,
      });
      setTelegramLinked(true);
      return;
    }
    // Fallback for local dev only
    console.log("[Roulette] Using fallback test user context");
    setUser((prevUser) => ({
      ...prevUser,
      id: "123456789",
      username: "testuser",
    }));
    setTelegramUser({
      id: "123456789",
      username: "testuser",
    });
    setTelegramLinked(true);
  }, []);

  // Fetch free spins from backend (admin only)
  const fetchFreeSpins = async (userId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/wallet/free-spins?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch free spins");
      const data = await res.json();
      setUser((prevUser) => ({ ...prevUser, freeSpinsAvailable: data.freeSpinsAvailable || 0 }));
    } catch (e) {
      console.error("Failed to fetch free spins", e);
    }
  };

  useEffect(() => {
    if (user.id) fetchFreeSpins(user.id);
  }, [user.id]);

  // Handle spin result
  const handleSpin = (prize: Prize, fairData: any) => {
    setWinner(prize)
    setUser((prevUser) => {
      const newUser = { ...prevUser }
      // Remove all free spin logic
      // Remove all LTC win logic
      newUser.totalSpins += 1
      newUser.lastSpinDate = new Date()
      return newUser
    })

    // Always record the spin as a transaction
    let type: "WIN" | "BONUS" | "LOSS" = "LOSS"
    let amount = 0
    if (prize.value && prize.value !== "No Prize") {
      type = "WIN"
      amount = 0
    } else {
      type = "LOSS"
      amount = 0
    }
    fetch("/api/prize-claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        prizeName: prize.name,
        prizeValue: prize.value || amount.toString(),
      }),
    })
      .then(() => {
        // After recording the spin, fetch free spins again (admin only)
        fetchFreeSpins(user.id)
      })
      .catch((err) => {
        console.error("Failed to record spin transaction:", err)
      })

    // Send result to Telegram if in WebApp
    // @ts-ignore
    if (window.Telegram && window.Telegram.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.sendData(
        JSON.stringify({
          prize: prize.name,
          value: prize.value,
          timestamp: new Date().toISOString(),
          provablyFairData: {
            serverSeed: fairData.serverSeed,
            clientSeed: fairData.clientSeed,
            nonce: fairData.nonce,
            hash: fairData.hash,
          },
        }),
      )
    }
  }

  // Calculate if the spin button should be disabled
  const canSpin = user.freeSpinsAvailable > 0 || user.balance >= 0.1;

  if (isTelegram === null) {
    return <div>Loading...</div>;
  }
  if (!isTelegram) {
    return <div>Please open this app from Telegram.</div>;
  }

  // Render the component
  return (
    <div className="flex flex-col items-center w-full max-w-md">
      <Card className="w-full mb-4 bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-200">Balance</p>
              <p className="text-xl font-bold text-gray-200">{user.balance.toFixed(4)} LTC</p>
            </div>
            <div>
              <p className="text-sm text-gray-200">Free Spins</p>
              <p className="text-xl font-bold text-center text-gray-200">{user.freeSpinsAvailable}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="wheel" className="w-full mt-4" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="wheel">Wheel</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="wheel" className="mt-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-2/3">
              <FancyWheel
                prizes={prizes}
                onSpin={handleSpin}
                disabled={!canSpin}
                spinCost={0}
                freeSpins={0}
              />
            </div>
            <div className="w-full md:w-1/3 mt-4 md:mt-0">
              <PrizeLegend prizes={prizes} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="wallet">
          <div className="flex flex-col items-center w-full">
            <WalletSection userId={user.id} username={user.username} />
          </div>
        </TabsContent>
        <TabsContent value="rules">
          <RulesSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
