/**
 * @file apps/web/src/lib/solanaPay.ts
 * @description Solana Pay (USDC) ödeme yardımcısı.
 *   - createPaymentURL : Phantom/Solflare'in okuyabileceği `solana:` URL oluşturur.
 *   - verifyPayment    : Referans anahtarına ait on-chain USDC transferini doğrular.
 *
 * Çevre değişkenleri:
 *   PAYMENT_WALLET_ADDRESS  – tahsilat cüzdanı (mainnet Solana adresi)
 *   NEXT_PUBLIC_SOLANA_RPC_URL – opsiyonel özel RPC
 */

import { PublicKey, Connection } from '@solana/web3.js';
import { encodeURL, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

/** USDC mint adresi (mainnet-beta) */
export const USDC_MINT = new PublicKey(
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

/** PRO abonelik ücreti: 29 USDC/ay */
export const PRO_PRICE_USDC = new BigNumber(29);

/** Tahsilat cüzdanı – çevre değişkeninden okunur */
export function getRecipient(): PublicKey {
  const addr = process.env.PAYMENT_WALLET_ADDRESS;
  if (!addr) {
    throw new Error('PAYMENT_WALLET_ADDRESS environment variable is not set');
  }
  return new PublicKey(addr);
}

/** RPC bağlantısı */
export function getConnection(): Connection {
  const rpc =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    'https://api.mainnet-beta.solana.com';
  return new Connection(rpc, 'confirmed');
}

// ─── URL Oluşturma ────────────────────────────────────────────────────────────

/**
 * Solana Pay USDC transfer URL'si oluşturur.
 *
 * @param reference  – Bu ödemeye özgü tek-kullanımlık PublicKey
 * @param buyerAddress – Alıcı/kullanıcı cüzdan adresi (memo olarak eklenir)
 * @returns `solana:` şemasında URL string
 */
export function createPaymentURL(
  reference: PublicKey,
  buyerAddress: string
): string {
  const url = encodeURL({
    recipient: getRecipient(),
    splToken: USDC_MINT,
    amount: PRO_PRICE_USDC,
    reference,
    label: 'Catalyst Terminal PRO',
    message: '30-day PRO Subscription — Catalyst Terminal',
    memo: buyerAddress.slice(0, 32), // memo max 32 byte
  });

  return url.toString();
}

// ─── Doğrulama ────────────────────────────────────────────────────────────────

/**
 * Verilen referans anahtarı ile on-chain USDC transferini doğrular.
 *
 * @returns İşlem imzası (signature)
 * @throws  FindReferenceError  – işlem henüz yok (tekrar dene)
 * @throws  ValidateTransferError – işlem geçersiz (miktar/alıcı yanlış)
 */
export async function verifyPayment(
  connection: Connection,
  reference: PublicKey
): Promise<string> {
  // 1. Referans anahtarına sahip onaylanmış bir işlem bul
  const signatureInfo = await findReference(connection, reference, {
    finality: 'confirmed',
  });

  // 2. Miktarı, alıcıyı ve USDC tokenını doğrula
  await validateTransfer(
    connection,
    signatureInfo.signature,
    {
      recipient: getRecipient(),
      amount: PRO_PRICE_USDC,
      splToken: USDC_MINT,
      reference,
    },
    { commitment: 'confirmed' }
  );

  return signatureInfo.signature;
}
