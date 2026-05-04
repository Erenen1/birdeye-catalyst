'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Zap, Shield, Crown, Check, Copy, Share2, ArrowRight, ExternalLink } from 'lucide-react';

export default function UpgradePage() {
  const { address } = useAccount();
  const [userStatus, setUserStatus] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (address) {
      fetch(`/api/user/status?address=${address}`)
        .then(res => res.json())
        .then(data => setUserStatus(data));
    }
  }, [address]);

  const copyReferral = () => {
    if (!userStatus?.referralCode) return;
    const url = `${window.location.origin}/?ref=${userStatus.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPro = userStatus?.tier === 'pro';

  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1c1d24] pb-8">
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
            <Crown className="text-amber" /> Catalyst_PRO
          </h3>
          <p className="text-[10px] md:text-[11px] font-mono text-[#4a4b52] max-w-md uppercase">
            Unlock ultra-fast execution and institutional-grade analytics nodes.
          </p>
        </div>
        {isPro && (
          <div className="px-4 py-2 bg-amber/10 border border-amber/30 text-amber text-[10px] font-bold uppercase tracking-widest">
            SUBSCRIPTION_ACTIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Free Plan */}
        <div className="p-8 border border-[#1c1d24] bg-black/40 flex flex-col gap-8 opacity-60">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#4a4b52] uppercase tracking-widest">Basic_Access</span>
            <h4 className="text-xl font-bold text-white uppercase">Standard</h4>
            <div className="text-2xl font-bold text-white">$0 <span className="text-[10px] text-[#4a4b52]">/MONTH</span></div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 text-[11px] text-[#849587]">
              <Check size={14} className="text-mint" /> 60s Polling Interval
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#849587]">
              <Check size={14} className="text-mint" /> 3 Active Nodes
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#849587]">
              <Check size={14} className="text-mint" /> Basic Security Filters
            </div>
          </div>

          <button disabled className="w-full py-4 border border-[#1c1d24] text-[#4a4b52] text-[10px] font-bold uppercase tracking-widest cursor-default">
            CURRENT_PLAN
          </button>
        </div>

        {/* Pro Plan */}
        <div className="p-8 border-2 border-amber/30 bg-black relative flex flex-col gap-8 shadow-amber-glow">
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber text-black text-[9px] font-bold uppercase tracking-widest">Recommended</div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-amber uppercase tracking-widest">High_Performance</span>
            <h4 className="text-xl font-bold text-white uppercase">Catalyst_PRO</h4>
            <div className="text-2xl font-bold text-white">$29 <span className="text-[10px] text-amber">/MONTH</span></div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3 text-[11px] text-white">
              <Zap size={14} className="text-amber fill-amber/20" /> 10s Ultra-Fast Polling
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white">
              <Shield size={14} className="text-amber fill-amber/20" /> Advanced Security Nodes
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white">
              <Crown size={14} className="text-amber fill-amber/20" /> Unlimited Active Nodes
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white">
              <Share2 size={14} className="text-amber fill-amber/20" /> Webhook & Discord Exports
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white">
              <Crown size={14} className="text-amber fill-amber/20" /> Certified Alpha Blueprints
            </div>
          </div>

          <button 
            onClick={() => {
              if (!address) {
                setError('Please connect your wallet first.');
                return;
              }
              // Helio Pay link with metadata for our webhook
              const helioUrl = `https://app.helio.xyz/pay/65f123abc?walletAddress=${address}`;
              window.open(helioUrl, '_blank');
            }}
            className="w-full py-4 bg-amber text-black text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            Initialize_Payment <ExternalLink size={14} />
          </button>
          {error && (
            <p className="text-[10px] text-red-500 font-mono uppercase text-center mt-2 animate-pulse">{error}</p>
          )}
          <p className="text-[8px] font-mono text-[#4a4b52] text-center uppercase tracking-tighter mt-4">Powered by Helio Pay // SPL Tokens Accepted</p>
        </div>

        {/* Affiliate Section */}
        <div className="p-8 border border-[#1c1d24] bg-[#08090d] flex flex-col gap-8">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-mint uppercase tracking-widest">Growth_Program</span>
            <h4 className="text-xl font-bold text-white uppercase">Affiliate</h4>
            <div className="text-[10px] text-[#4a4b52] uppercase leading-relaxed">Earn 20% commission or 1 week Pro extension for every successful referral.</div>
          </div>

          <div className="flex-1 space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-[9px] font-mono text-[#4a4b52] uppercase">Your_Referral_Link</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={userStatus?.referralCode ? `${window.location.origin}/?ref=${userStatus.referralCode}` : 'INITIALIZING...'}
                  className="flex-1 bg-black border border-[#1c1d24] px-4 py-2 text-[10px] font-mono text-white focus:outline-none"
                />
                <button 
                  onClick={copyReferral}
                  className="p-2 border border-[#1c1d24] text-[#4a4b52] hover:text-mint transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#1c1d24] bg-black/20 text-center">
                <div className="text-xs font-bold text-white">0</div>
                <div className="text-[7px] font-mono text-[#4a4b52] uppercase mt-1">Clicks</div>
              </div>
              <div className="p-4 border border-[#1c1d24] bg-black/20 text-center">
                <div className="text-xs font-bold text-mint">0</div>
                <div className="text-[7px] font-mono text-[#4a4b52] uppercase mt-1">Conversions</div>
              </div>
            </div>
          </div>

          <div className="text-[8px] font-mono text-[#4a4b52] leading-tight uppercase">
            * Payouts are processed weekly in USDC directly to your connected wallet.
          </div>
        </div>
      </div>
    </div>
  );
}
