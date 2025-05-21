import { createHash, randomBytes } from "crypto"

// Interface for the provably fair system
export interface ProvablyFairData {
  serverSeed: string
  clientSeed: string
  nonce: number
  result: number
  hash: string
  signature: string
}

// Generate a server seed (kept secret until after the spin)
export function generateServerSeed(): string {
  return randomBytes(32).toString("hex")
}

// Generate a client seed (can be provided by the client or generated)
export function generateClientSeed(): string {
  return randomBytes(16).toString("hex")
}

// Generate a provably fair random number between 0 and 1
export function generateProvablyFairRandom(serverSeed: string, clientSeed: string, nonce: number): ProvablyFairData {
  // Combine the seeds and nonce
  const message = `${serverSeed}:${clientSeed}:${nonce}`

  // Create a SHA-256 hash of the combined data
  const hash = createHash("sha256").update(message).digest("hex")

  // Use the first 8 characters of the hash as a hex number
  const hexResult = hash.substring(0, 8)

  // Convert the hex to a decimal between 0 and 1
  const decimalResult = Number.parseInt(hexResult, 16) / 0xffffffff

  // Create a signature for verification
  const signature = createHash("sha256").update(`${serverSeed}:${hash}:${nonce}`).digest("hex")

  return {
    serverSeed,
    clientSeed,
    nonce,
    result: decimalResult,
    hash,
    signature,
  }
}

// Verify a previously generated result
export function verifyProvablyFairResult(data: ProvablyFairData): boolean {
  const { serverSeed, clientSeed, nonce, hash, signature } = data

  // Recreate the hash
  const message = `${serverSeed}:${clientSeed}:${nonce}`
  const calculatedHash = createHash("sha256").update(message).digest("hex")

  // Recreate the signature
  const calculatedSignature = createHash("sha256").update(`${serverSeed}:${hash}:${nonce}`).digest("hex")

  // Verify both the hash and signature match
  return hash === calculatedHash.substring(0, hash.length) && signature === calculatedSignature
}

// Map a random number to a specific outcome based on probabilities
export function mapRandomToOutcome(random: number, outcomes: { probability: number }[]): number {
  let cumulativeProbability = 0

  for (let i = 0; i < outcomes.length; i++) {
    cumulativeProbability += outcomes[i].probability
    if (random <= cumulativeProbability) {
      return i
    }
  }

  // Fallback to the last outcome
  return outcomes.length - 1
}
