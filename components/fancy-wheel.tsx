"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// @ts-ignore
import confetti from "canvas-confetti"
declare module "canvas-confetti";
import type { Prize } from "@/types/game"
import { generateProvablyFairRandom, generateServerSeed, generateClientSeed } from "@/lib/provable-random"

interface FancyWheelProps {
  prizes: Prize[]
  onSpin: (prize: Prize, provablyFairData: any) => void
  disabled?: boolean
  spinCost: number
  freeSpins: number
}

export function FancyWheel({
  prizes,
  onSpin,
  disabled = false,
  spinCost,
  freeSpins,
}: FancyWheelProps) {
  // Add CSS animations for the wheel
  const pulseAnimation = `
    @keyframes pulse-glow {
      0% { filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5)); }
      100% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)); }
    }
    @keyframes winner-pulse {
      0% { opacity: 0.8; }
      100% { opacity: 1; }
    }
  `

  // Add the animation styles to the document
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = pulseAnimation
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const wheelRef = useRef<HTMLDivElement>(null)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [winner, setWinner] = useState<Prize | null>(null)
  const [serverSeed, setServerSeed] = useState<string>(generateServerSeed())
  const [clientSeed, setClientSeed] = useState<string>(generateClientSeed())
  const [nonce, setNonce] = useState<number>(0)
  const [winningSegment, setWinningSegment] = useState<number | null>(null)

  // Rearrange prizes to distribute same colors around the wheel
  const rearrangePrizes = (prizeList: Prize[]): Prize[] => {
    if (!prizeList || prizeList.length === 0) return []

    // Group prizes by color
    const prizesByColor: Record<string, Prize[]> = {}

    prizeList.forEach((prize) => {
      if (!prizesByColor[prize.color]) {
        prizesByColor[prize.color] = []
      }
      prizesByColor[prize.color].push(prize)
    })

    // Distribute prizes evenly
    const result: Prize[] = []
    const colorKeys = Object.keys(prizesByColor)
    let currentIndex = 0

    while (Object.values(prizesByColor).some((group) => group.length > 0)) {
      const color = colorKeys[currentIndex % colorKeys.length]

      if (prizesByColor[color] && prizesByColor[color].length > 0) {
        result.push(prizesByColor[color].shift()!)
      }

      currentIndex++
    }

    return result
  }

  // Use rearranged prizes
  const displayPrizes = rearrangePrizes(prizes && prizes.length > 0 ? prizes : [])

  // Function to spin the wheel
  const spinWheel = () => {
    if (spinning || disabled || !displayPrizes || displayPrizes.length === 0) return
    setSpinning(true)
    setWinner(null)
    setWinningSegment(null)

    // Generate provably fair result
    const fairData = generateProvablyFairRandom(serverSeed, clientSeed, nonce)

    // Determine the winning prize based on probability
    let cumulativeProbability = 0
    let winningIndex = 0

    for (let i = 0; i < displayPrizes.length; i++) {
      cumulativeProbability += displayPrizes[i].probability
      if (fairData.result <= cumulativeProbability) {
        winningIndex = i
        break
      }
    }

    // Calculate the rotation angle
    // Each segment is 360 / prizes.length degrees
    const segmentAngle = 360 / displayPrizes.length

    // Calculate the final angle to stop at the winning prize
    // We add 5-10 full rotations for effect
    const extraRotations = 5 + Math.floor(Math.random() * 5)
    const baseAngle = 360 * extraRotations

    // The winning segment should be at the bottom (which is 180 degrees in our wheel)
    // This is different from the previous implementation where the pointer was at the top
    const winningPosition = 180 // Bottom position

    // Calculate the center of the winning segment
    const winningAngle = winningIndex * segmentAngle

    // Final rotation is base rotations + adjustment to get the winning segment at the bottom
    const finalRotation = baseAngle + (winningPosition - winningAngle)

    // Animate the wheel
    const startTime = Date.now()
    const duration = 5000 // 5 seconds
    const startRotation = rotation
    const rotationDifference = finalRotation - (rotation % 360)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for a nice deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
      const currentProgress = easeOut(progress)

      const currentRotation = startRotation + rotationDifference * currentProgress
      setRotation(currentRotation)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Spinning complete
        setSpinning(false)
        setWinner(displayPrizes[winningIndex])
        setWinningSegment(winningIndex)

        // Trigger confetti for wins
        if (displayPrizes[winningIndex].value && displayPrizes[winningIndex].value !== "No Prize") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        }

        // Call the onSpin callback
        onSpin(displayPrizes[winningIndex], fairData)

        // Update seeds for next spin
        setServerSeed(generateServerSeed())
        setNonce((prevNonce) => prevNonce + 1)
      }
    }

    animate()
  }

  // Get prize label - just use the name
  const getPrizeLabel = (prize: Prize) => {
    return prize.name
  }

  return (
    <div className="relative">
      {/* GIF overlay while spinning */}
      {spinning && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 'calc(50% - 2.5vw)',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px 8px rgba(0, 0, 0, 0.25)',
            }}
          >
            <img
              src="/spinner.gif"
              alt="Spinning..."
              style={{ width: 120, height: 120, opacity: 0.92, borderRadius: '50%' }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col items-center w-full">
        <div className="relative mb-8 w-full max-w-md aspect-square">
          {/* Golden outer ring with shadow effect */}
          <div
            className="absolute inset-0 rounded-full border-[16px] border-yellow-500 bg-blue-900"
            style={{
              boxShadow: "0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.5)",
              background: "radial-gradient(circle, #1a365d 0%, #0f172a 100%)",
            }}
          >
            {/* Black inner ring */}
            <div className="absolute inset-[2px] rounded-full border-[4px] border-black"></div>
          </div>

          {/* Wheel segments */}
          <div
            ref={wheelRef}
            className="absolute inset-[24px] rounded-full overflow-hidden transform-gpu"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "none" : "transform 0.5s ease-out",
              filter: spinning ? "drop-shadow(0 0 10px rgba(255, 215, 0, 0.7))" : "none",
              animation: spinning ? "pulse-glow 1.5s infinite alternate" : "none",
            }}
          >
            {displayPrizes.map((prize, index) => {
              const segmentAngle = 360 / displayPrizes.length
              const startAngle = index * segmentAngle

              // Determine if this segment is the winning segment
              const isWinningSegment = winningSegment === index

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
                    className="absolute inset-0 transition-colors duration-300"
                    style={{
                      backgroundColor: prize.color,
                      transformOrigin: "bottom right",
                      boxShadow: isWinningSegment
                        ? `inset 0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5)`
                        : "inset 0 0 10px rgba(0, 0, 0, 0.2)",
                      animation: isWinningSegment ? "winner-pulse 1s infinite alternate" : "none",
                    }}
                  >
                    {/* Prize text - properly centered and rotated */}
                    <div
                      className="absolute"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* This div rotates the text to be readable from outside the wheel */}
                      <div
                        style={{
                          position: "absolute",
                          width: "140%", // Extend beyond the segment for better positioning
                          textAlign: "center",
                          transform: `rotate(${90 + segmentAngle / 2}deg)`,
                          transformOrigin: "0% 50%",
                          left: "30%",
                          top: "15%",
                        }}
                      >
                        <span
                          className="text-white font-bold text-lg md:text-xl"
                          style={{
                            textShadow: "0 1px 2px rgba(0, 0, 0, 0.8), 0 0 5px rgba(0, 0, 0, 0.5)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getPrizeLabel(prize)}
                        </span>
                      </div>
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
                className="text-yellow-400 font-bold text-xl md:text-2xl"
                style={{ textShadow: "0 2px 2px rgba(0, 0, 0, 0.5)" }}
              >
                SPIN
              </span>
            </div>
          </div>
        </div>

        {/* Triangle pointer at the bottom */}
        <div className="relative w-full max-w-md">
          <div
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
            style={{ filter: "drop-shadow(0 0 5px rgba(255, 215, 0, 0.7))" }}
          >
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-l-transparent border-r-transparent border-b-yellow-500"></div>
          </div>
        </div>

        <Button
          onClick={spinWheel}
          disabled={spinning || disabled}
          className="w-full max-w-md bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-yellow-700"
          style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)" }}
        >
          {spinning ? "Spinning..." : `SPIN`}
        </Button>

        {/* Win message as modal overlay */}
        {winner && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-4 border-yellow-500 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center max-w-xs mx-auto">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: winner.color }}
              >
                <span className="text-2xl font-bold text-white">{winner.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-bold mb-1 text-white">
                {winner.value && winner.value !== "No Prize"
                  ? "You Won!"
                  : winner.name === "FREE SPIN" || winner.name === "BONUS"
                    ? "You Got:"
                    : "Unlucky!"}
              </h3>
              <p className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                {winner.name}
              </p>
              {winner.value && winner.value !== "No Prize" && (
                <p className="text-sm text-white mt-1">
                  Prize: {winner.value}
                </p>
              )}
              <Button className="mt-4 w-full" onClick={() => setWinner(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
