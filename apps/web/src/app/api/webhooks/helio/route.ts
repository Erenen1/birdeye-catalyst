import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { UserModel } from '@chaintrigger/shared';

/**
 * Helio Pay Webhook Handler
 * @description Helio'dan gelen başarılı ödeme sinyallerini dinler ve kullanıcıyı PRO'ya yükseltir.
 */
export async function POST(request: Request) {
  try {
    await dbConnect();
    
    // 1. Secret Token Verification (Preventing Spoofing)
    const authHeader = request.headers.get('Authorization');
    const webhookSecret = process.env.HELIO_WEBHOOK_SECRET;
    
    // In production, always enforce secret check
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      console.warn('[Helio Webhook] Unauthorized access attempt blocked');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 2. Helio Event Check
    const validEvents = ['transaction.success', 'success', 'payment.success'];
    if (!validEvents.includes(body.event)) {
      return NextResponse.json({ message: 'Ignored event type' }, { status: 200 });
    }

    // 2. Metadata'dan cüzdan adresini al
    // Ödeme linki oluşturulurken 'customerWallet' veya 'metaData.walletAddress' olarak geçiyoruz.
    const walletAddress = body.metaData?.walletAddress || body.customerWallet;

    if (!walletAddress) {
      console.error('[Helio Webhook] No wallet address found in metadata');
      return NextResponse.json({ error: 'No wallet address' }, { status: 400 });
    }

    console.log(`[Helio Webhook] Processing payment for: ${walletAddress}`);

    // 3. Kullanıcıyı bul ve PRO yap
    const proDays = 30;
    const proUntil = new Date();
    proUntil.setDate(proUntil.getDate() + proDays);

    const user = await UserModel.findOneAndUpdate(
      { walletAddress: walletAddress.toLowerCase() },
      { 
        tier: 'pro',
        proUntil: proUntil
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Referral Reward Logic (Opsiyonel)
    // Eğer kullanıcıyı birisi getirdiyse, getiren kişiye 7 gün bonus verelim.
    if (user.referredBy) {
      const referrer = await UserModel.findOne({ referralCode: user.referredBy });
      if (referrer) {
        const currentUntil = referrer.proUntil || new Date();
        const newUntil = new Date(currentUntil);
        newUntil.setDate(newUntil.getDate() + 7); // +1 hafta bonus

        await UserModel.findOneAndUpdate(
          { referralCode: user.referredBy },
          { 
            tier: 'pro', // Referans olan kişi de pro olur (eğer değilse)
            proUntil: newUntil 
          }
        );
        console.log(`[Helio Webhook] Referral reward granted to: ${referrer.walletAddress}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${walletAddress} upgraded to PRO until ${proUntil.toISOString()}` 
    });

  } catch (error: any) {
    console.error('[Helio Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
