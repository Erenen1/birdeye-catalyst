'use client';

/**
 * @file apps/web/src/components/subscription/SphereCheckoutButton.tsx
 * @description Sphere Pay checkout'u başlatan buton bileşeni.
 *              Kullanıcının cüzdan adresiyle POST /api/subscriptions/checkout
 *              çağırır; dönen checkoutUrl'e yönlendirir.
 */

import { useState } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';

interface SphereCheckoutButtonProps {
  walletAddress: string;
  label?: string;
  className?: string;
}

export function SphereCheckoutButton({
  walletAddress,
  label = 'UPGRADE_TO_PRO',
  className = '',
}: SphereCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Checkout başlatılamadı.');
      }

      // Kullanıcıyı Sphere ödeme sayfasına yönlendir
      window.location.href = data.checkoutUrl;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        id="sphere-checkout-btn"
        onClick={handleCheckout}
        disabled={loading || !walletAddress}
        className={`w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            INITIALIZING_PAYMENT...
          </>
        ) : (
          <>
            {label}
            <ArrowUpRight size={14} />
          </>
        )}
      </button>

      {error && (
        <p className="text-[10px] font-mono text-red-500 uppercase text-center">
          ERROR: {error}
        </p>
      )}
    </div>
  );
}
