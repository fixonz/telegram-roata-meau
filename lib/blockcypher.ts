const BLOCKCYPHER_API = "https://api.blockcypher.com/v1/ltc/main/addrs/"

export interface BlockcypherTx {
  txid: string
  value: number // in LTC
  confirmations: number
  received: string
}

export async function getAllLtcTransactions(address: string): Promise<BlockcypherTx[]> {
  const url = `${BLOCKCYPHER_API}${address}/full?limit=50`
  const res = await fetch(url)
  if (!res.ok) {
    // If the wallet has no transactions, BlockCypher may return 404 or similar.
    // Just return an empty array instead of throwing.
    return []
  }
  const data = await res.json()
  if (!data.txs) return []
  return data.txs.map((tx: any) => ({
    txid: tx.hash,
    value: tx.outputs
      .filter((out: any) => out.addresses && out.addresses.includes(address))
      .reduce((sum: number, out: any) => sum + out.value, 0) / 1e8, // convert from satoshis
    confirmations: tx.confirmations,
    received: tx.received,
  }))
} 