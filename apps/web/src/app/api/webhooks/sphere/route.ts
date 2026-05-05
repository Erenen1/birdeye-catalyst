/**
 * @file apps/web/src/app/api/webhooks/sphere/route.ts
 * @description Sphere Pay webhook event'lerini dinler.
 *
 * Güvenlik:
 *  1. Ham body'yi oku (signature doğrulaması için stream'den Buffer al).
 *  2. Sphere-Signature header ile HMAC-SHA256 doğrulama yap.
 *  3. Doğrulanmış event'i 200 OK dönüp BullMQ'ya at.
 *     Veritabanına ASLA burada yazma — bu iş SphereWorker'ın.
 *
 * POST /api/webhooks/sphere
 */

import { NextRequest, NextResponse } from 'next/server';
import { Queue } from 'bullmq';
import { verifySphereWebhookSignature } from '@/lib/sphere';
import type { SphereWebhookEventPayload } from '@chaintrigger/shared';

// ─── BullMQ Queue (singleton-ish, per cold start) ────────────────────────────

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

const sphereEventQueue = new Queue<SphereWebhookEventPayload>('sphere-events', {
  connection: { host: redisHost, port: redisPort },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: true,
    removeOnFail: 500,
  },
});

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * Next.js App Router'da ham body okumak için config gerekir.
 * Body parsing'i kapatıyoruz; Buffer'ı elle okuyoruz.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Ham body'yi oku (imza doğrulaması Buffer üzerinde yapılmalı)
  const rawBody = Buffer.from(await req.arrayBuffer());

  // 2. Sphere-Signature header'ını al
  const signature = req.headers.get('sphere-signature') ?? '';

  if (!signature) {
    console.warn('[Sphere Webhook] Signature header eksik — istek reddedildi.');
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  // 3. İmza doğrulama
  const isValid = verifySphereWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[Sphere Webhook] Geçersiz imza — istek reddedildi.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // 4. Payload'ı parse et
  let payload: SphereWebhookEventPayload;
  try {
    payload = JSON.parse(rawBody.toString('utf-8')) as SphereWebhookEventPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 5. Zorunlu alanları kontrol et
  if (!payload.eventId || !payload.eventType || !payload.sphereSubscriptionId) {
    return NextResponse.json(
      { error: 'Payload eksik alan içeriyor: eventId, eventType, sphereSubscriptionId zorunludur.' },
      { status: 400 }
    );
  }

  // 6. BullMQ'ya at (idempotency: jobId = eventId)
  await sphereEventQueue.add(payload.eventType, payload, {
    jobId: payload.eventId,
  });

  console.log(
    `[Sphere Webhook] ✅ Event kuyruğa alındı: ${payload.eventType} | ID: ${payload.eventId} | Sub: ${payload.sphereSubscriptionId}`
  );

  // 7. Sphere'e 200 dön — işi worker halleder
  return NextResponse.json({ received: true }, { status: 200 });
}
