/**
 * @file apps/worker/src/queue/SphereWorker.ts
 * @description BullMQ worker — Sphere webhook event'lerini işler.
 *
 * Sorumluluklar:
 *  - 'sphere-events' kuyruğunu dinle
 *  - payment.succeeded / subscription.activated → kullanıcıyı PRO yap
 *  - payment.failed → grace period uygula, süresi dolunca FREE'ye al
 *  - subscription.canceled → kullanıcıyı FREE'ye al
 *  - Her event için PaymentLog kaydı oluştur (idempotency: spherePaymentId)
 *
 * Veritabanına YALNIZCA bu worker yazar.
 */

import { Worker, Job } from 'bullmq';
import {
  SphereWebhookEventPayload,
  SphereSubscriptionModel,
  SpherePaymentLogModel,
  UserModel,
} from '@chaintrigger/shared';

/** Ödeme başarısız olduktan kaç gün sonra erişim kesilir */
const GRACE_PERIOD_DAYS = 3;

export class SphereWorker {
  private worker: Worker<SphereWebhookEventPayload>;

  constructor(private redisHost: string, private redisPort: number) {
    this.worker = new Worker<SphereWebhookEventPayload>(
      'sphere-events',
      this.processJob.bind(this),
      {
        connection: { host: this.redisHost, port: this.redisPort },
        concurrency: 5,
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`[SphereWorker] ✅ Job tamamlandı: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[SphereWorker] ❌ Job başarısız: ${job?.id}`, err);
    });
  }

  // ─── Ana İşlem Döngüsü ──────────────────────────────────────────────────────

  private async processJob(job: Job<SphereWebhookEventPayload>) {
    const { eventType, eventId, sphereCustomerId, sphereSubscriptionId, data } =
      job.data;

    console.log(
      `[SphereWorker] İşleniyor: ${eventType} | Sub: ${sphereSubscriptionId} | Event: ${eventId}`
    );

    switch (eventType) {
      case 'subscription.activated':
      case 'payment.succeeded':
        await this.handleSuccess(job.data);
        break;

      case 'subscription.past_due':
      case 'payment.failed':
        await this.handlePaymentFailed(job.data);
        break;

      case 'subscription.canceled':
        await this.handleCanceled(job.data);
        break;

      default:
        console.warn(`[SphereWorker] Bilinmeyen event tipi: ${eventType}`);
    }
  }

  // ─── Abonelik Aktifleşti / Ödeme Başarılı ───────────────────────────────────

  private async handleSuccess(payload: SphereWebhookEventPayload) {
    const { eventId, eventType, sphereCustomerId, sphereSubscriptionId, data } =
      payload;

    const periodStart = (data.current_period_start as number)
      ? new Date((data.current_period_start as number) * 1000)
      : new Date();

    const periodEnd = (data.current_period_end as number)
      ? new Date((data.current_period_end as number) * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const amount = (data.amount as number) ?? 0;
    const userId = (data.metadata as Record<string, string>)?.userId ?? '';

    // 1. Abonelik kaydını upsert et
    await SphereSubscriptionModel.findOneAndUpdate(
      { sphereSubscriptionId },
      {
        userId,
        sphereCustomerId,
        sphereSubscriptionId,
        status: 'active',
        plan: (data.plan as string) ?? 'pro',
        chain: 'solana',
        currency: 'USDC',
        amount,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        gracePeriodEnd: null, // Grace sıfırla
      },
      { upsert: true, new: true }
    );

    // 2. Kullanıcıyı PRO yap
    if (userId) {
      await UserModel.findByIdAndUpdate(userId, {
        tier: 'pro',
        proUntil: periodEnd,
      });
      console.log(`[SphereWorker] 🎉 Kullanıcı ${userId} → PRO (${periodEnd.toISOString()})`);
    }

    // 3. Ödeme logu kaydet (idempotent)
    await this.upsertPaymentLog({
      userId,
      sphereSubscriptionId,
      spherePaymentId: eventId,
      status: 'succeeded',
      amount,
      eventType,
      rawPayload: payload.data,
    });
  }

  // ─── Ödeme Başarısız ────────────────────────────────────────────────────────

  private async handlePaymentFailed(payload: SphereWebhookEventPayload) {
    const { eventId, eventType, sphereSubscriptionId, data } = payload;

    const userId = (data.metadata as Record<string, string>)?.userId ?? '';
    const amount = (data.amount as number) ?? 0;

    const sub = await SphereSubscriptionModel.findOne({ sphereSubscriptionId });

    if (!sub) {
      // Henüz abonelik kaydı yoksa oluşturma; webhook sırası farklı gelebilir
      console.warn(
        `[SphereWorker] Abonelik bulunamadı: ${sphereSubscriptionId}. Job retry'a bırakılıyor.`
      );
      throw new Error(`Subscription not found: ${sphereSubscriptionId}`);
    }

    const now = new Date();

    if (!sub.gracePeriodEnd) {
      // İlk başarısız ödeme → grace period başlat
      const gracePeriodEnd = new Date(
        now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
      );
      sub.gracePeriodEnd = gracePeriodEnd;
      sub.status = 'past_due';
      await sub.save();
      console.log(
        `[SphereWorker] ⚠️ Grace period başladı (${gracePeriodEnd.toISOString()}) — Sub: ${sphereSubscriptionId}`
      );
    } else if (now > sub.gracePeriodEnd) {
      // Grace süresi doldu → FREE'ye al
      sub.status = 'unpaid';
      await sub.save();

      if (userId) {
        await UserModel.findByIdAndUpdate(userId, {
          tier: 'free',
          proUntil: null,
        });
        console.log(`[SphereWorker] 🔴 Grace süresi doldu — Kullanıcı ${userId} → FREE`);
      }
    } else {
      console.log(
        `[SphereWorker] ⏳ Hâlâ grace period içinde: ${sub.gracePeriodEnd.toISOString()}`
      );
    }

    await this.upsertPaymentLog({
      userId,
      sphereSubscriptionId,
      spherePaymentId: eventId,
      status: 'failed',
      amount,
      eventType,
      rawPayload: payload.data,
    });
  }

  // ─── Abonelik İptal ─────────────────────────────────────────────────────────

  private async handleCanceled(payload: SphereWebhookEventPayload) {
    const { eventId, eventType, sphereSubscriptionId, data } = payload;

    const sub = await SphereSubscriptionModel.findOneAndUpdate(
      { sphereSubscriptionId },
      { status: 'canceled' },
      { new: true }
    );

    if (sub && sub.userId) {
      await UserModel.findByIdAndUpdate(sub.userId, {
        tier: 'free',
        proUntil: null,
      });
      console.log(
        `[SphereWorker] 🚫 Abonelik iptal edildi — Kullanıcı ${sub.userId} → FREE`
      );
    }

    const userId = sub?.userId ?? (data.metadata as Record<string, string>)?.userId ?? '';
    const amount = (data.amount as number) ?? 0;

    await this.upsertPaymentLog({
      userId,
      sphereSubscriptionId,
      spherePaymentId: eventId,
      status: 'succeeded', // İptal başarıyla gerçekleşti
      amount,
      eventType,
      rawPayload: payload.data,
    });
  }

  // ─── Yardımcı: PaymentLog Kaydet (idempotent) ───────────────────────────────

  private async upsertPaymentLog(params: {
    userId: string;
    sphereSubscriptionId: string;
    spherePaymentId: string;
    status: 'succeeded' | 'failed' | 'pending';
    amount: number;
    eventType: string;
    rawPayload: Record<string, unknown>;
  }) {
    try {
      await SpherePaymentLogModel.findOneAndUpdate(
        { spherePaymentId: params.spherePaymentId },
        {
          $setOnInsert: {
            userId: params.userId,
            sphereSubscriptionId: params.sphereSubscriptionId,
            spherePaymentId: params.spherePaymentId,
            status: params.status,
            amount: params.amount,
            currency: 'USDC',
            chain: 'solana',
            eventType: params.eventType,
            rawPayload: params.rawPayload,
          },
        },
        { upsert: true, new: true }
      );
    } catch (err: unknown) {
      // Duplicate key → zaten kayıtlı, güvenle yoksay
      if ((err as NodeJS.ErrnoException).code === '11000') {
        console.log(
          `[SphereWorker] PaymentLog zaten mevcut (idempotent): ${params.spherePaymentId}`
        );
      } else {
        throw err;
      }
    }
  }

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────

  public async close() {
    await this.worker.close();
    console.log('[SphereWorker] Worker kapatıldı.');
  }
}
