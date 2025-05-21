import type { Prize } from "@/types/game"

interface PrizeLegendProps {
  prizes: Prize[]
}

export function PrizeLegend({ prizes }: PrizeLegendProps) {
  // Sort prizes by probability (rarest first)
  const sortedPrizes = [...prizes].sort((a, b) => a.probability - b.probability)

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 w-full">
      <h3 className="text-lg font-bold mb-3 text-center">Prize Legend</h3>
      <div className="grid grid-cols-1 gap-2">
        {sortedPrizes.map((prize) => (
          <div key={prize.id} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: prize.color }} />
            <span className="text-sm">{prize.name}</span>
            <span className="text-xs text-gray-400 ml-auto">
              {prize.value && prize.value !== "No Prize"
                ? prize.value
                : prize.name === "FREE SPIN"
                  ? "1 Free Spin"
                  : prize.name === "BONUS"
                    ? "Special Bonus"
                    : "No Prize"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
