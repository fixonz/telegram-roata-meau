import { Roulette } from "@/components/roulette"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white">
      <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
        Bine ai venit la Roata lui Miau
      </h1>
      <p className="text-gray-300 mb-8 text-center max-w-md">Adauga LTC pentru spin-uri cu premii speciale !</p>
      <Roulette />
    </main>
  )
}
