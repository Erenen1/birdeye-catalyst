export const dynamic = 'force-dynamic';

/**
 * POST /api/payment/create
 * Body: { buyerAddress: string }
 *
 * Yeni bir Solana Pay ödeme isteği oluşturur:
 *   1. Tek kullanımlık referans anahtarı (Keypair) üretir
 *   2. Kullanıcı kaydına pending referansı yazar
 *   3. `solana:` URL + referans döner → frontend QR/derin link için kullanır
 */

import { NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';
import { createPaymentURL } from '@/lib/solanaPay';
import dbConnect from '@/lib/db';
import { UserModel } from '@chaintrigger/shared';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buyerAddress } = body as { buyerAddress?: string };

    if (!buyerAddress || typeof buyerAddress !== 'string') {
      return NextResponse.json(
        { error: 'buyerAddress is required' },
        { status: 400 }
      );
    }

    // Tek-kullanımlık referans anahtarı — bu imdatıyla tx bulunur
    const reference = Keypair.generate().publicKey;

    // Kullanıcı kaydına pending referansı yaz (upsert)
    await dbConnect();
    await UserModel.findOneAndUpdate(
      { walletAddress: buyerAddress },
      { pendingPaymentReference: reference.toBase58() },
      { upsert: true, new: true }
    );

    const url = createPaymentURL(reference, buyerAddress);

    return NextResponse.json({
      url,
      reference: reference.toBase58(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Payment/Create]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
