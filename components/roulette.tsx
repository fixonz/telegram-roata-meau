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
  const [usedFallback, setUsedFallback] = useState(false)

  useEffect(() => {
    // Set default prizes on mount, never clear
    const defaultPrizes = [
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
    ];
    setPrizes(defaultPrizes);
    console.log("[Roulette] Prizes set:", defaultPrizes);
  }, []);

  useEffect(() => {
    const initTelegram = () => {
      // @ts-ignore
      if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
        // @ts-ignore
        const tg = window.Telegram.WebApp;
        
        // Ensure the WebApp is ready and expanded
        try {
          tg.ready(); 
          tg.expand(); 
          console.log("[Roulette] Telegram WebApp ready() and expand() called.");
        } catch (e) {
          console.error("[Roulette] Error calling tg.ready() or tg.expand():", e);
        }

        const tgUser = tg.initDataUnsafe?.user;

        if (tgUser && tgUser.id) { // Crucial check for tgUser.id
          console.log("[Roulette] Telegram context DETECTED with valid user:", tgUser);
          const currentUserId = tgUser.id.toString();
          const currentUsername = tgUser.username || `user${tgUser.id}`;

          setUser(prevUser => ({
            ...prevUser,
            id: currentUserId,
            username: currentUsername,
          }));
          setTelegramUser({
            id: currentUserId,
            username: currentUsername,
          });
          setTelegramLinked(true);
          setIsTelegram(true);
          setUsedFallback(false);
        } else {
          console.error("[Roulette] Telegram context detected, but tgUser.id is missing or invalid.", tgUser);
          // Fallback if user data is incomplete or missing
          setUser(prevUser => ({ ...prevUser, id: "123456789", username: "testuser" }));
          setTelegramUser({ id: "123456789", username: "testuser" });
          setTelegramLinked(true);
          setIsTelegram(true); // Allow app to render but with fallback data
          setUsedFallback(true);
        }
      } else {
        console.log("[Roulette] Telegram context NOT detected, using fallback.");
        // Fallback for local/dev/unsupported clients
        setUser(prevUser => ({ ...prevUser, id: "123456789", username: "testuser" }));
        setTelegramUser({ id: "123456789", username: "testuser" });
        setTelegramLinked(true);
        setIsTelegram(true); // Allow app to render but with fallback data
        setUsedFallback(true);
      }
    };

    // Attempt to initialize with a small delay to allow Telegram to inject its objects
    const timer = setTimeout(initTelegram, 250); // Increased delay slightly

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []); // Empty dependency array means this runs once on mount

  // This useEffect is for debugging the final user state after context detection
  useEffect(() => {
    console.log("[Roulette Debug] Final user state - id:", user.id, "username:", user.username, "isTelegram:", isTelegram, "usedFallback:", usedFallback);
    // @ts-ignore
    if(typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp){
        // @ts-ignore
        console.log("[Roulette Debug] window.Telegram.WebApp.initDataUnsafe?.user:", window.Telegram.WebApp.initDataUnsafe?.user);
    }
  }, [user.id, user.username, isTelegram, usedFallback]);

  // Fetch free spins from backend (admin only, skip for fallback test user)
  const fetchFreeSpins = async (userId: string) => {
    if (!userId || userId === "123456789") return;
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
    if (user.id && user.id !== "123456789") fetchFreeSpins(user.id);
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

  console.log("[Roulette Render] user.id:", user.id, "username:", user.username);

  // Render the component
  return (
    <div className="flex flex-col items-center w-full max-w-md">
      {usedFallback && (
        <div style={{ color: 'orange', margin: '1em 0', textAlign: 'center' }}>
          <b>Warning:</b> Telegram user context not detected.<br />
          You are using a test account. Some features may not work as expected.
        </div>
      )}
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
