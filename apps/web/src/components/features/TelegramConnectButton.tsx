'use client';

import { useState } from 'react';
import { Send, CheckCircle2, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Props {
  isConnected: boolean;
}

export function TelegramConnectButton({ isConnected }: Props) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConnect = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/telegram/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (res.ok && data.link) {
        window.open(data.link, '_blank');
      } else {
        setError(data.error || 'Failed to generate link');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkConfirmed = async () => {
    if (!address) return;
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/telegram/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      if (res.ok) {
        window.location.reload();
      } else {
        setError('Failed to unlink');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ─── Custom Confirmation Modal ─────────────────────────────── */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          onClick={() => setShowConfirm(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal Panel */}
          <div
            className="relative z-10 w-full max-w-sm mx-4 border border-red-500/30 bg-[#08090d] shadow-[0_0_60px_rgba(239,68,68,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

            <div className="p-7 space-y-6">
              {/* Icon + Title */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-0.5 p-2 bg-red-500/10 border border-red-500/20">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-red-500 uppercase tracking-[0.25em]">
                    Disconnect_Protocol
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">
                    Unlink Telegram?
                  </h3>
                </div>
              </div>

              {/* Body */}
              <p className="text-[11px] font-mono text-[#a4a5ab] uppercase leading-relaxed">
                You will{' '}
                <span className="text-red-400">no longer receive</span> real-time
                Telegram alerts for any of your active monitoring nodes.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-[#1c1d24] text-[#a4a5ab] hover:border-white/20 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUnlinkConfirmed}
                  className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TG Active Button ─────────────────────────────────────── */}
      {isConnected ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={loading}
          className="relative flex items-center gap-2 px-3 py-1.5 border border-[#1c1d24] bg-[#0c0d12] text-[#4a4b52] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all group disabled:opacity-50"
          title="Click to disconnect Telegram"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              <CheckCircle2 size={12} className="text-mint group-hover:hidden" />
              <XCircle size={12} className="text-red-500 hidden group-hover:block" />
            </>
          )}
          <span className="text-[9px] font-mono tracking-widest uppercase group-hover:hidden">
            TG_Active
          </span>
          <span className="text-[9px] font-mono tracking-widest uppercase hidden group-hover:inline">
            Disconnect
          </span>
          {error && (
            <span className="absolute -bottom-6 right-0 text-[8px] text-red-500 whitespace-nowrap">
              {error}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={loading || !address}
          className="relative flex items-center gap-2 px-3 py-1.5 border border-[#1c1d24] hover:bg-[#1da1f2]/10 hover:border-[#1da1f2] hover:text-[#1da1f2] text-[#4a4b52] transition-all group disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin text-[#1da1f2]" />
          ) : (
            <Send size={12} className="group-hover:text-[#1da1f2] transition-all" />
          )}
          <span className="text-[9px] font-mono tracking-widest uppercase">
            {loading ? 'Pairing...' : 'Link_Telegram'}
          </span>
          {error && (
            <span className="absolute -bottom-6 right-0 text-[8px] text-red-500 whitespace-nowrap">
              {error}
            </span>
          )}
        </button>
      )}
    </>
  );
}
