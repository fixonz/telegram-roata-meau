import * as bitcoin from 'bitcoinjs-lib'
import * as bip39 from 'bip39'
import * as BIP32Factory from 'bip32'
import * as ecc from 'tiny-secp256k1'
import { setUserDepositInfo, storeAdminWalletSecret } from "./user-deposits"
import { Buffer } from "buffer"

const bip32 = BIP32Factory.default(ecc)

// Litecoin network params
const litecoin = {
  messagePrefix: '\x19Litecoin Signed Message:\n',
  bech32: 'ltc',
  bip32: {
    public: 0x019da462,
    private: 0x019d9cfe,
  },
  pubKeyHash: 0x30,
  scriptHash: 0x32,
  wif: 0xb0,
}

// Generate a new Litecoin wallet with mnemonic
export function generateLtcWalletWithMnemonic() {
  const mnemonic = bip39.generateMnemonic()
  const seed = bip39.mnemonicToSeedSync(mnemonic)
  const root = bip32.fromSeed(seed, litecoin)
  const child = root.derivePath("m/44'/2'/0'/0/0") // BIP44 for Litecoin
  const payment = bitcoin.payments.p2pkh({
    pubkey: Buffer.from(child.publicKey),
    network: litecoin,
  })
  if (!payment.address) throw new Error('Failed to generate Litecoin address')
  return {
    address: payment.address,
    privateKey: child.toWIF(),
    mnemonic,
  }
}

// Register a new deposit address for a user and store in user_deposits.json and admin_wallet_secrets.json
export async function registerUserDepositAddress(userId: string, telegramId: string, username: string): Promise<string> {
  const wallet = generateLtcWalletWithMnemonic()
  setUserDepositInfo(userId, {
    address: wallet.address,
    creditedTxs: [],
    telegramId,
    username,
  })
  storeAdminWalletSecret(userId, {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic,
    telegramId,
    username,
  })
  return wallet.address
}

export function isValidAddress(address: string): boolean {
  try {
    bitcoin.address.toOutputScript(address, litecoin)
    return true
  } catch {
    return false
  }
}
