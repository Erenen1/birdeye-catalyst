import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basit bir In-Memory Rate Limiter (Üretim ortamında Redis önerilir)
const ipCache = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT_COUNT = 30; // 10 saniyede maksimum 30 istek
const RATE_LIMIT_WINDOW = 10000; // 10 saniye

export function middleware(request: NextRequest) {
  // Sadece API rotalarını koru
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip || 'anonymous';
    const now = Date.now();

    const clientData = ipCache.get(ip) || { count: 0, lastReset: now };

    // Zaman penceresi dolduysa sıfırla
    if (now - clientData.lastReset > RATE_LIMIT_WINDOW) {
      clientData.count = 0;
      clientData.lastReset = now;
    }

    clientData.count++;
    ipCache.set(ip, clientData);

    // Sınır aşıldıysa 429 (Too Many Requests) dön
    if (clientData.count > RATE_LIMIT_COUNT) {
      console.warn(`[Rate Limit] IP Blocked: ${ip}`);
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const response = NextResponse.next();

  // Ekstra Güvenlik Header'ları (Middleware katmanında)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

// Hangi yolların bu middleware'den geçeceğini belirle
export const config = {
  matcher: ['/api/:path*'],
};
