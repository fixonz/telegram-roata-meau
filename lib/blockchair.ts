// import fetch from "node-fetch"

const BLOCKCHAIR_API = "https://api.blockchair.com/litecoin/dashboards/address/"

export interface BlockchairTx {
  txid: string
  value: number
  time: string
  block_id: number
  is_confirmed: boolean
}

export async function getConfirmedLtcDeposits(address: string): Promise<BlockchairTx[]> {
  const url = `${BLOCKCHAIR_API}${address}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Blockchair API error")
  const data = await res.json()
  const txs = data.data[address]?.transactions || []
  const details = data.data[address]?.utxo || []
  // Only confirmed incoming transactions
  return details
    .filter((utxo: any) => utxo.recipient === address && utxo.block_id && utxo.spending_block_id === null)
    .map((utxo: any) => ({
      txid: utxo.transaction_hash,
      value: utxo.value / 1e8,
      time: utxo.time,
      block_id: utxo.block_id,
      is_confirmed: true,
    }))
} 