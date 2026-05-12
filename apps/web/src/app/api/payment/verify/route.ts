export const dynamic = 'force-dynamic';

/**
 * GET /api/payment/verify?reference=<base58>&buyer=<address>
 *
 * Solana Pay ödeme doğrulaması:
 *   1. Referans anahtarına sahip onaylı bir işlem arar (FindReference)
 *   2. Miktarı, alıcıyı ve USDC token'ı doğrular (ValidateTransfer)
 *   3. Doğrulama başarılıysa kullanıcıyı PRO yapar (30 gün)
 *
 * Yanıtlar:
 *   { status: 'pending' }                   – henüz işlem yok
 *   { status: 'invalid', error: string }    – geçersiz işlem
 *   { success: true, signature: string }    – ödeme onaylandı
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { FindReferenceError, ValidateTransferError } from '@solana/pay';
import { verifyPayment, getConnection } from '@/lib/solanaPay';
import dbConnect from '@/lib/db';
import { UserModel } from '@chaintrigger/shared';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');
  const buyer = searchParams.get('buyer');

  if (!reference || !buyer) {
    return NextResponse.json(
      { error: 'reference and buyer are required' },
      { status: 400 }
    );
  }

  let refPubkey: PublicKey;
  try {
    refPubkey = new PublicKey(reference);
  } catch {
    return NextResponse.json({ error: 'Invalid reference key' }, { status: 400 });
  }

  try {
    const connection = getConnection();
    const signature = await verifyPayment(connection, refPubkey);

    // ── Ödeme doğrulandı → kullanıcıyı PRO yap ──────────────────────────────
    await dbConnect();
    const proUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 gün

    await UserModel.findOneAndUpdate(
      { walletAddress: buyer },
      {
        tier: 'pro',
        proUntil,
        $unset: { pendingPaymentReference: '' },
      }
    );

    console.log(
      `[Payment/Verify] ✅ PRO activated — buyer=${buyer} signature=${signature}`
    );

    return NextResponse.json({ success: true, signature });

  } catch (err: unknown) {
    // Henüz işlem bulunamadı → frontend tekrar dener
    if (err instanceof FindReferenceError) {
      return NextResponse.json({ status: 'pending' });
    }

    // İşlem bulundu ama geçersiz (yanlış miktar / alıcı / token)
    if (err instanceof ValidateTransferError) {
      console.warn('[Payment/Verify] ❌ Invalid transfer:', (err as Error).message);
      return NextResponse.json(
        { status: 'invalid', error: (err as Error).message },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Payment/Verify] Error:', message);
    return NextResponse.json({ status: 'error', error: message }, { status: 500 });
  }
}
