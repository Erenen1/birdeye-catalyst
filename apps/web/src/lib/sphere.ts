/**
 * @file apps/web/src/lib/sphere.ts
 * @description Sphere Pay API istemcisi.
 *              Abonelik linki oluşturma ve webhook imza doğrulama
 *              işlemlerini yönetir.
 *
 * Sphere API docs: https://docs.spherepay.co
 */

import crypto from 'crypto';

// ─── Ortam Değişkenleri ───────────────────────────────────────────────────────

const SPHERE_API_KEY = process.env.SPHERE_API_KEY;
const SPHERE_WEBHOOK_SECRET = process.env.SPHERE_WEBHOOK_SECRET;
const SPHERE_PRODUCT_ID = process.env.SPHERE_PRODUCT_ID;
const SPHERE_API_BASE = 'https://api.spherepay.co/v1';

// ─── Yardımcı: API isteği gönder ─────────────────────────────────────────────

async function sphereRequest<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  if (!SPHERE_API_KEY) {
    throw new Error('[Sphere] SPHERE_API_KEY environment variable is not set.');
  }

  const res = await fetch(`${SPHERE_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${SPHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`[Sphere] API error ${res.status}: ${errText}`);
  }

  return res.json() as Promise<T>;
}

// ─── Tip Tanımları ────────────────────────────────────────────────────────────

export interface SpherePaymentLinkResponse {
  /** Kullanıcının yönlendirileceği Sphere checkout URL'si */
  url: string;
  /** Sphere'deki payment link ID'si */
  id: string;
}

// ─── Sphere İşlemleri ─────────────────────────────────────────────────────────

/**
 * Belirli bir kullanıcı için Sphere'de bir abonelik ödeme linki oluşturur.
 * Kullanıcı bu URL'e yönlendirilir; ödeme tamamlanınca Sphere webhook gönderir.
 *
 * @param walletAddress - Solana cüzdan adresi (prefill için)
 * @param userId        - Dahili MongoDB userId (metadata)
 * @param successUrl    - Ödeme başarılı olunca dönülecek URL
 * @param cancelUrl     - Kullanıcı iptal ederse dönülecek URL
 */
export async function createSphereSubscriptionLink(
  walletAddress: string,
  userId: string,
  successUrl: string,
  cancelUrl: string
): Promise<SpherePaymentLinkResponse> {
  if (!SPHERE_PRODUCT_ID) {
    throw new Error('[Sphere] SPHERE_PRODUCT_ID environment variable is not set.');
  }

  const data = await sphereRequest<SpherePaymentLinkResponse>(
    'POST',
    '/paymentLink',
    {
      lineItems: [
        {
          product: SPHERE_PRODUCT_ID,
          quantity: 1,
        },
      ],
      successUrl,
      cancelUrl,
      metadata: {
        userId,
        walletAddress,
      },
      // Müşteri cüzdanını önceden doldur (Sphere destekliyorsa)
      customerWallet: walletAddress,
    }
  );

  return data;
}

// ─── Webhook İmza Doğrulama ───────────────────────────────────────────────────

/**
 * Sphere'in gönderdiği webhook isteğinin imzasını doğrular.
 * HMAC-SHA256 ile hesaplar ve timing-safe compare yapar.
 *
 * @param rawBody  - Ham request body (Buffer veya string)
 * @param signature - `Sphere-Signature` header değeri
 * @returns Geçerli ise true, değilse false
 */
export function verifySphereWebhookSignature(
  rawBody: Buffer | string,
  signature: string
): boolean {
  if (!SPHERE_WEBHOOK_SECRET) {
    console.error('[Sphere] SPHERE_WEBHOOK_SECRET is not set — imza doğrulanamaz!');
    return false;
  }

  const hmac = crypto.createHmac('sha256', SPHERE_WEBHOOK_SECRET);
  hmac.update(typeof rawBody === 'string' ? rawBody : rawBody);
  const digest = hmac.digest('hex');

  // Sphere imzası genellikle "sha256=<hex>" formatında gelir
  const cleanSignature = signature.startsWith('sha256=')
    ? signature.slice(7)
    : signature;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(cleanSignature, 'hex')
    );
  } catch {
    return false;
  }
}
