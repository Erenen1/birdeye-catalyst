'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Crown, Zap, Shield, Activity, ArrowRight, ExternalLink, Cpu, Lock, Globe, Check, Copy } from 'lucide-react';

export default function UpgradePage() {
  const { address } = useAccount();
  const [userStatus, setUserStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetch(`/api/user/status?address=${address}`)
        .then(res => res.json())
        .then(data => setUserStatus(data));
    }
  }, [address]);

  const isPro = userStatus?.tier === 'pro';
  const helioPayId = process.env.NEXT_PUBLIC_HELIO_PAY_ID || '65f123abc';

  const copyReferral = () => {
    if (!userStatus?.referralCode) return;
    const url = `${window.location.origin}/?ref=${userStatus.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 md:space-y-16 pb-32 pt-4 md:pt-8 px-4 md:px-0">
      {/* Header with technical scanline effect */}
      <div className="relative border-l-4 border-amber pl-6 md:pl-8 py-4">
        <div className="absolute -left-[6px] top-0 w-2 h-2 bg-amber"></div>
        <div className="absolute -left-[6px] bottom-0 w-2 h-2 bg-amber"></div>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[9px] md:text-[10px] font-mono text-amber animate-pulse">SYSTEM_AUTH_REQUIRED</span>
          <div className="h-[1px] flex-1 bg-amber/20"></div>
        </div>
        <h1 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none italic">
          Level_Up <span className="text-amber">Catalyst_Pro</span>
        </h1>
        <p className="text-[#4a4b52] font-mono text-[10px] md:text-[11px] mt-4 uppercase tracking-[0.2em] md:tracking-[0.3em]">Institutional Grade DeFi Intelligence Node</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Benefits Terminal */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-[#08090d] border border-[#1c1d24] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
              <Cpu size={160} />
            </div>
            
            <div className="p-6 md:p-10 space-y-8 md:space-y-12 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-amber">
                    <Zap size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Ultra_Fast Polling</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#a4a5ab] leading-relaxed uppercase">
                    Bypass the 60s cooldown. Monitor new listings every <span className="text-white">10 seconds</span>. Be the absolute first to detect liquidity.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-amber">
                    <Shield size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Security_Armor</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#a4a5ab] leading-relaxed uppercase">
                    Advanced filters for <span className="text-white">Mint/Freeze authority</span> and Top 10 holder concentration.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-amber">
                    <Activity size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Unlimited Nodes</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#a4a5ab] leading-relaxed uppercase">
                    The 3-node limit is abolished. Deploy up to <span className="text-white">50 active monitoring nodes</span> across all chains.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-amber">
                    <Globe size={18} />
                    <span className="text-[11px] font-bold uppercase tracking-widest">Multi-Chain Alpha</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#a4a5ab] leading-relaxed uppercase">
                    Priority access to all chains (Base, Sol, Eth, Arb). Unified cross-chain hunting intelligence.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#1c1d24] flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8">
                  <div className="space-y-1">
                    <div className="text-[8px] font-mono text-[#4a4b52] uppercase">Node_Status</div>
                    <div className="text-[10px] font-mono text-white flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-mint animate-pulse"></div> READY_FOR_SYNC
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[8px] font-mono text-[#4a4b52] uppercase">Processing</div>
                    <div className="text-[10px] font-mono text-white">V2_ENGINE</div>
                  </div>
                </div>
                <div className="hidden sm:block text-[8px] font-mono text-[#1c1d24]">
                  AUTH_REF: CAT-PRO-NODE-001
                </div>
              </div>
            </div>
          </div>

          {/* Referral Section (Mini) */}
          <div className="border border-[#1c1d24] bg-[#0c0d12]/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="text-[10px] font-bold text-white uppercase tracking-widest">Alpha_Affiliate_Program</div>
              <p className="text-[9px] font-mono text-[#4a4b52] uppercase">Extend your Pro status by 7 days for every successful node initialization.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <input 
                 type="text" 
                 readOnly 
                 value={userStatus?.referralCode ? `${window.location.origin}/?ref=${userStatus.referralCode}` : 'INITIALIZING...'}
                 className="flex-1 md:w-64 bg-black border border-[#1c1d24] px-3 py-2 text-[10px] font-mono text-white focus:outline-none truncate"
               />
               <button 
                 onClick={copyReferral}
                 className="px-4 border border-mint/30 text-mint hover:bg-mint hover:text-black transition-all"
               >
                 {copied ? <Check size={14} /> : <Copy size={14} />}
               </button>
            </div>
          </div>
        </div>

        {/* Right: Pricing Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <div className={`border-2 ${isPro ? 'border-mint shadow-[0_0_40px_rgba(34,197,94,0.05)]' : 'border-amber shadow-[0_0_40px_rgba(255,184,0,0.1)]'} bg-[#08090d] relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-16 h-16 ${isPro ? 'bg-mint' : 'bg-amber'} -rotate-45 translate-x-10 -translate-y-10`}></div>
              
              <div className="p-8 md:p-12 space-y-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Crown size={14} className={isPro ? 'text-mint' : 'text-amber'} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#4a4b52]">Subscription_Binding</span>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white uppercase italic">Full_Power</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl md:text-6xl font-black text-white">$29</span>
                    <span className="text-[#4a4b52] font-mono text-[12px] uppercase">/ 30_Days</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-mint uppercase">
                      <Check size={10} /> Instant Activation
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-mono text-mint uppercase">
                      <Check size={10} /> Priority Network Bandwidth
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <div className="p-4 bg-black border border-[#1c1d24] flex items-center gap-4 group cursor-help">
                    <div className="w-10 h-10 border border-[#1c1d24] flex items-center justify-center shrink-0 group-hover:border-amber transition-all">
                       <Lock size={16} className="text-[#4a4b52] group-hover:text-amber" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-white uppercase">Secured by Helio Pay</div>
                      <div className="text-[8px] font-mono text-[#4a4b52] uppercase">SPL / SOL / USDC / CARD</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!address) {
                        setError('WALLET_CONNECTION_MISSING');
                        return;
                      }
                      const helioUrl = `https://app.helio.xyz/pay/${helioPayId}?walletAddress=${address}`;
                      window.open(helioUrl, '_blank');
                    }}
                    disabled={isPro}
                    className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                      isPro 
                      ? 'bg-mint/10 text-mint border border-mint cursor-default' 
                      : 'bg-amber text-black hover:scale-[1.01] active:scale-[0.99] shadow-glow hover:brightness-110'
                    }`}
                  >
                    {isPro ? 'NODE_ACTIVE_PRO' : 'INITIALIZE_UPGRADE'} 
                    {isPro ? <Shield size={16} /> : <ArrowRight size={16} />}
                  </button>

                  {error && (
                    <div className="text-[10px] font-mono text-red-500 text-center uppercase animate-pulse border border-red-500/30 p-3 bg-red-500/5">
                      ERROR_LOG: {error}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-col gap-2">
                   <div className="flex justify-between text-[8px] font-mono text-[#4a4b52] uppercase">
                      <span>Sync_Progress</span>
                      <span>{isPro ? '100%' : 'WAITING_FOR_TX'}</span>
                   </div>
                   <div className="w-full h-1 bg-[#1c1d24] relative overflow-hidden">
                      <div className={`absolute inset-0 bg-amber/30 ${isPro ? 'w-full' : 'animate-loading-shimmer'}`}></div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
