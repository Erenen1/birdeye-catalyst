'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Zap, Activity, Shield } from 'lucide-react';
import SecurityModal from '@/components/features/SecurityModal';

export default function TerminalPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [globalAlerts, setGlobalAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSecurity, setSelectedSecurity] = useState<any | null>(null);

  const fetchGlobalAlerts = useCallback(async () => {
    try {
      const res = await fetch(`/api/alerts?userId=GLOBAL`);
      const data = await res.json();
      if (Array.isArray(data)) setGlobalAlerts(data);
    } catch (error) {
      console.error('Error fetching global alerts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const trackToken = async (alert: any) => {
    if (!address) return;
    try {
      const res = await fetch('/api/tracked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: address,
          tokenAddress: alert.token.address,
          symbol: alert.token.symbol,
          name: alert.token.name,
          entryPrice: alert.token.price || 0,
          entryLiquidity: alert.token.liquidity,
          chain: alert.chain,
        }),
      });
      if (res.ok) {
        router.push('/portfolio');
      }
    } catch (error) {
      console.error('Error tracking token:', error);
    }
  };

  useEffect(() => {
    fetchGlobalAlerts();
    const interval = setInterval(fetchGlobalAlerts, 30000);
    return () => clearInterval(interval);
  }, [fetchGlobalAlerts]);

  const formatTimeAgo = (date: any) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#1c1d24] pb-6 gap-4">
         <div className="space-y-2 md:space-y-1">
           <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Alpha Terminal</h3>
           <p className="text-[10px] md:text-[11px] font-mono text-[#4a4b52] max-w-md">Aggregated real-time signals from all active Catalyst Nodes across the network.</p>
         </div>
         <div className="text-[9px] md:text-[10px] font-mono text-mint flex items-center gap-2 bg-mint/5 px-3 py-1.5 border border-mint/10">
           <div className="w-1.5 h-1.5 bg-mint animate-pulse"></div>
           NETWORK_SYNCHRONIZED: {globalAlerts.length} SIGNALS
         </div>
      </div>

      <div className="border border-[#1c1d24] bg-[#08090d] divide-y divide-[#1c1d24]">
         {loading ? (
            <div className="p-20 text-center animate-pulse text-[#4a4b52] font-mono uppercase text-[10px]">Syncing_Oracles...</div>
         ) : globalAlerts.length > 0 ? globalAlerts.map((alert) => (
           <div key={alert._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-white/[0.02] transition-all border-l-2 border-transparent hover:border-mint gap-4 sm:gap-0">
              <div className="flex items-center gap-4 md:gap-6">
                 <div className="w-10 h-10 md:w-12 md:h-12 border border-[#1c1d24] flex items-center justify-center bg-[#0c0d12] text-mint font-bold text-sm md:text-base">
                    {alert.token.symbol[0]}
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-bold text-white uppercase tracking-wide">
                       {alert.token.name} <span className="text-[#4a4b52] font-normal text-[9px] md:text-[10px]">({alert.token.symbol})</span>
                    </div>
                    <div className="text-[9px] font-mono text-[#4a4b52]">
                       TRIGGERED_BY: <span className="text-amber">NODE_{alert.ruleId.slice(-4)}</span> <span className="hidden xs:inline">•</span> <span className="text-mint block xs:inline">{alert.chain.toUpperCase()}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-12 text-right">
                 <div className="space-y-1">
                    <div className="text-[7px] md:text-[8px] font-mono text-[#4a4b52] uppercase">Liquidity</div>
                    <div className="text-[10px] font-mono text-white">${alert.token.liquidity.toLocaleString()}</div>
                 </div>
                 <div className="space-y-1 hidden xs:block">
                    <div className="text-[7px] md:text-[8px] font-mono text-[#4a4b52] uppercase">Safety</div>
                    <div className="text-[10px] font-mono text-mint">{alert.security.securityScore}/100</div>
                 </div>
                 <div className="space-y-1">
                    <div className="text-[7px] md:text-[8px] font-mono text-[#4a4b52] uppercase">Detected</div>
                    <div className="text-[10px] font-mono text-[#a4a5ab]">{formatTimeAgo(alert.createdAt)}</div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedSecurity(alert)}
                      className="p-2 md:p-2.5 border border-[#1c1d24] text-[#4a4b52] hover:text-mint hover:border-mint transition-all"
                      title="Safety Radar"
                    >
                      <Shield size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button 
                      onClick={() => trackToken(alert)}
                      className="px-4 md:px-5 py-2 md:py-2.5 border border-[#1c1d24] text-[9px] font-mono font-bold text-amber hover:bg-amber hover:text-black transition-all uppercase tracking-widest"
                    >
                      TRACK
                    </button>
                 </div>
              </div>
           </div>
         )) : (
            <div className="p-20 text-center space-y-4">
               <Activity size={32} className="mx-auto text-[#1c1d24] animate-pulse" />
               <p className="text-[10px] font-mono text-[#4a4b52] uppercase tracking-[0.2em]">Waiting for network events... Active nodes scanning.</p>
            </div>
         )}
      </div>

      {selectedSecurity && (
        <SecurityModal 
          tokenName={selectedSecurity.token.name}
          tokenSymbol={selectedSecurity.token.symbol}
          data={{
            securityScore: selectedSecurity.security.securityScore,
            mintAuthority: selectedSecurity.security.mintAuthority,
            freezeAuthority: selectedSecurity.security.freezeAuthority,
            top10HolderPercent: selectedSecurity.security.top10HolderPercent,
            liquidity: selectedSecurity.token.liquidity
          }}
          onClose={() => setSelectedSecurity(null)}
        />
      )}
    </div>
  );
}
