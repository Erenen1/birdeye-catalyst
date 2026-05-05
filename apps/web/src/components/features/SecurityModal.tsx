'use client';

import { useEffect } from 'react';
import { X, ShieldCheck, ShieldAlert, Lock, Users, Droplets, Info } from 'lucide-react';

interface SecurityData {
  securityScore: number;
  mintAuthority: boolean;
  freezeAuthority: boolean;
  top10HolderPercent: number;
  liquidity: number;
}

interface SecurityModalProps {
  tokenName: string;
  tokenSymbol: string;
  data: SecurityData;
  onClose: () => void;
}

export default function SecurityModal({ tokenName, tokenSymbol, data, onClose }: SecurityModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const score      = data.securityScore ?? 0;
  const scoreColor = score > 70 ? 'text-mint' : score > 40 ? 'text-amber' : 'text-red-500';
  const scoreBar   = score > 70 ? 'bg-mint'   : score > 40 ? 'bg-amber'   : 'bg-red-500';
  const verdict    = score > 80 ? 'HIGH_CONFIDENCE' : score > 60 ? 'CAUTION' : 'HIGH_RISK';

  const metrics = [
    {
      icon: <ShieldCheck size={13} className={scoreColor} />,
      label: 'Security Score',
      hint: "Birdeye's 0–100 safety rating. Combines on-chain risk factors — higher is safer.",
      value: `${score}/100`,
      valueClass: scoreColor,
    },
    {
      icon: <Users size={13} className="text-amber" />,
      label: 'Top 10 Holders',
      hint: 'Total supply held by the 10 largest wallets. Above 60% raises whale-dump risk.',
      value: `${(data.top10HolderPercent ?? 0).toFixed(1)}%`,
      valueClass: (data.top10HolderPercent ?? 0) > 60 ? 'text-red-500' : 'text-white',
    },
    {
      icon: data.mintAuthority
        ? <ShieldAlert size={13} className="text-red-500" />
        : <Lock size={13} className="text-mint" />,
      label: 'Mint Authority',
      hint: 'If active, the deployer can print new tokens at will, inflating supply and diluting holders.',
      value: data.mintAuthority ? 'ACTIVE ⚠️' : 'REVOKED ✅',
      valueClass: data.mintAuthority ? 'text-red-500' : 'text-mint',
    },
    {
      icon: data.freezeAuthority
        ? <ShieldAlert size={13} className="text-red-500" />
        : <Lock size={13} className="text-mint" />,
      label: 'Freeze Authority',
      hint: 'If active, the deployer can freeze wallets and block transfers — a major DeFi red flag.',
      value: data.freezeAuthority ? 'ACTIVE ⚠️' : 'REVOKED ✅',
      valueClass: data.freezeAuthority ? 'text-red-500' : 'text-mint',
    },
    {
      icon: <Droplets size={13} className="text-blue-400" />,
      label: 'Liquidity',
      hint: 'Total USD value locked in the trading pool. Low liquidity increases slippage and manipulation risk.',
      value: `$${(data.liquidity ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
      valueClass: (data.liquidity ?? 0) > 50000 ? 'text-white' : 'text-amber',
    },
  ];

  return (
    /* Backdrop — click outside to close */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop propagation */}
      <div
        className="relative w-full max-w-sm bg-[#08090d] border border-[#1c1d24] shadow-[0_0_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[60px] pointer-events-none ${score > 70 ? 'bg-mint/15' : 'bg-red-500/15'}`} />

        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[#1c1d24]">
          <div>
            <div className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest mb-0.5">Safety Radar</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">{tokenName}</h3>
            <p className="text-[9px] font-mono text-mint mt-0.5">{tokenSymbol}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#4a4b52] hover:text-white transition-colors mt-0.5 hover:bg-white/5 rounded"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Score bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-[#4a4b52] uppercase tracking-widest">Overall Score</span>
            <span className={`text-sm font-black font-mono ${scoreColor}`}>{score}/100</span>
          </div>
          <div className="h-1 bg-[#1c1d24] w-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${scoreBar}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className={`text-[8px] font-mono uppercase mt-1.5 text-right ${scoreColor}`}>
            {verdict}
          </div>
        </div>

        {/* Metrics */}
        <div className="px-4 pb-4 space-y-2 mt-1">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center justify-between py-2 border-b border-[#1c1d24]/60 last:border-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {m.icon}
                <div className="min-w-0">
                  <div className="text-[9px] font-mono text-[#a4a5ab] uppercase">{m.label}</div>
                  <div className="text-[8px] font-mono text-[#4a4b52] leading-tight mt-0.5 max-w-[170px]">{m.hint}</div>
                </div>
              </div>
              <span className={`text-[10px] font-bold font-mono ml-3 shrink-0 ${m.valueClass}`}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-[8px] font-mono text-[#4a4b52] leading-relaxed flex gap-1.5">
            <Info size={10} className="shrink-0 mt-px" />
            Data sourced from Birdeye Oracle in real-time. Not financial advice. Always DYOR.
          </p>
        </div>
      </div>
    </div>
  );
}
