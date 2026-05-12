'use client';

/**
 * @file apps/web/src/components/subscription/SolanaPayButton.tsx
 * @description Solana Pay (USDC) ödeme akışı:
 *   1. "Pay" butonuna basıldığında /api/payment/create çağrılır
 *   2. Dönen `solana:` URL ile QR kodu render edilir
 *   3. Kullanıcı Phantom/Solflare ile QR'ı okur veya "Open in Wallet" linke tıklar
 *   4. Her 3 saniyede /api/payment/verify poll edilir
 *   5. Onay gelince onSuccess callback çalışır
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Loader2,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'polling'
  | 'success'
  | 'invalid'
  | 'error';

interface SolanaPayButtonProps {
  /** Ödeme başarıyla onaylandığında çalışır */
  onSuccess?: (signature: string) => void;
  /** Ödeme tutarı (display only) */
  priceLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SolanaPayButton({
  onSuccess,
  priceLabel = '29 USDC / 30 Days',
}: SolanaPayButtonProps) {
  const { publicKey } = useWallet();
  const address = publicKey?.toBase58();

  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [reference, setReference] = useState('');
  const [signature, setSignature] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Temizlik ──────────────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // ── Ödeme oluştur ─────────────────────────────────────────────────────────
  const createPayment = async () => {
    if (!address) return;
    setStatus('loading');
    setErrorMsg('');
    stopPolling();

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerAddress: address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment creation failed');

      setPaymentUrl(data.url);
      setReference(data.reference);
      setStatus('ready');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  // ── Ödeme doğrula (polling) ───────────────────────────────────────────────
  const checkPayment = useCallback(async () => {
    if (!reference || !address) return;

    try {
      const res = await fetch(
        `/api/payment/verify?reference=${reference}&buyer=${address}`
      );
      const data = await res.json();

      if (data.success) {
        stopPolling();
        setSignature(data.signature);
        setStatus('success');
        onSuccess?.(data.signature);
        return;
      }

      if (data.status === 'invalid') {
        stopPolling();
        setErrorMsg(data.error || 'Invalid transfer detected');
        setStatus('invalid');
      }
      // 'pending' → devam et
    } catch {
      // Ağ hatası → polling'e devam et
    }
  }, [reference, address, onSuccess, stopPolling]);

  // Polling'i ready → polling geçişinde başlat
  useEffect(() => {
    if (status !== 'ready') return;
    setStatus('polling');
    pollIntervalRef.current = setInterval(checkPayment, 3000);
  }, [status, checkPayment]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── Başarı ────────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 p-8 border border-mint/30 bg-mint/5 animate-in fade-in duration-500">
        <div className="w-16 h-16 border border-mint/30 bg-mint/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-mint" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-sm font-black text-white uppercase tracking-[0.2em]">
            Payment Confirmed
          </div>
          <div className="text-[10px] font-mono text-[#4a4b52] uppercase">
            PRO access activated — 30 days
          </div>
        </div>
        {signature && (
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[9px] font-mono text-mint/60 hover:text-mint transition-all border border-mint/20 px-3 py-1.5"
          >
            View Transaction on Solscan
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    );
  }

  // ── QR / Polling ──────────────────────────────────────────────────────────
  if (status === 'ready' || status === 'polling') {
    return (
      <div className="space-y-5">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-white inline-block">
              <QRCodeSVG
                value={paymentUrl}
                size={180}
                level="M"
                imageSettings={{
                  src: '/favicon.ico',
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            {status === 'polling' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={20} className="animate-spin text-mint" />
                  <span className="text-[8px] font-mono text-mint uppercase tracking-widest">
                    Awaiting Tx...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Durum satırı */}
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#4a4b52] uppercase">
            <div className="w-1.5 h-1.5 bg-mint animate-pulse" />
            {status === 'polling'
              ? 'Waiting for on-chain confirmation...'
              : 'Scan with Phantom / Solflare'}
          </div>

          {/* Wallet derin bağlantısı */}
          <a
            href={paymentUrl}
            className="flex items-center gap-2 px-5 py-2.5 border border-mint/30 text-mint text-[10px] font-bold uppercase tracking-widest hover:bg-mint hover:text-black transition-all"
          >
            <Smartphone size={14} />
            Open in Wallet
          </a>

          {/* Ödeme detayı */}
          <div className="text-center space-y-1">
            <div className="text-[8px] font-mono text-[#4a4b52] uppercase">
              Send exactly{' '}
              <span className="text-white font-bold">{priceLabel}</span>
            </div>
            <div className="text-[7px] font-mono text-[#2a2b32] uppercase">
              USDC · Solana Pay · On-Chain Verified
            </div>
          </div>

          {/* Yeni ödeme oluştur */}
          <button
            onClick={createPayment}
            className="flex items-center gap-1.5 text-[8px] font-mono text-[#4a4b52] hover:text-white transition-all"
          >
            <RefreshCw size={10} />
            Generate new QR
          </button>
        </div>
      </div>
    );
  }

  // ── Hata ─────────────────────────────────────────────────────────────────
  if (status === 'error' || status === 'invalid') {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 border border-red-500/30 bg-red-500/5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-red-400 uppercase">
              {status === 'invalid' ? 'Invalid Transfer' : 'Payment Error'}
            </div>
            <div className="text-[9px] font-mono text-[#4a4b52]">{errorMsg}</div>
          </div>
        </div>
        <button
          onClick={createPayment}
          className="w-full py-3 border border-[#1c1d24] text-[9px] font-bold uppercase tracking-widest text-[#4a4b52] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={12} />
          Try Again
        </button>
      </div>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="w-full py-4 flex items-center justify-center gap-2 bg-mint/10 border border-mint/20 text-[10px] font-bold uppercase tracking-[0.2em] text-mint">
        <Loader2 size={14} className="animate-spin" />
        Generating Payment Request...
      </div>
    );
  }

  // ── Idle (başlangıç) ──────────────────────────────────────────────────────
  return (
    <button
      id="solana-pay-btn"
      onClick={createPayment}
      disabled={!address}
      className="w-full py-4 flex items-center justify-center gap-2 bg-mint text-black text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
      title={!address ? 'Connect your wallet first' : undefined}
    >
      <Zap size={14} />
      Pay {priceLabel} — Upgrade to PRO
    </button>
  );
}
