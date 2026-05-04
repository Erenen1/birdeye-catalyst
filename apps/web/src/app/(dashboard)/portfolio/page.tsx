'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Terminal, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [trackedTokens, setTrackedTokens] = useState<any[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchTracked = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/tracked?userId=${address}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrackedTokens(data);
        // Fetch current prices for all tracked tokens
        data.forEach(async (token) => {
          const pRes = await fetch(`/api/tokens/price?address=${token.tokenAddress}&chain=${token.chain}`);
          const pData = await pRes.json();
          if (pData?.value) {
            setCurrentPrices(prev => ({ ...prev, [token.tokenAddress]: pData.value }));
          }
        });
      }
    } catch (error) {
      console.error('Error fetching tracked:', error);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected) fetchTracked();
  }, [isConnected, fetchTracked]);

  const calculatePnL = (entry: number, current: number) => {
    if (!entry || !current) return 0;
    return ((current - entry) / entry) * 100;
  };

  const totalPnL = trackedTokens.reduce((acc, token) => {
    const current = currentPrices[token.tokenAddress] || token.entryPrice;
    return acc + calculatePnL(token.entryPrice, current);
  }, 0) / (trackedTokens.length || 1);

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1c1d24] pb-8">
         <div className="space-y-2 md:space-y-1">
           <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Performance Monitor</h3>
           <p className="text-[10px] md:text-[11px] font-mono text-[#4a4b52] max-w-md">Simulated PnL tracking for detected alpha opportunities in real-time.</p>
         </div>
         <div className="flex items-center justify-between md:justify-end gap-6 border md:border-none border-[#1c1d24] p-4 md:p-0 bg-[#08090d] md:bg-transparent">
            <div className="text-left md:text-right">
               <div className="text-[8px] font-mono text-[#4a4b52] uppercase tracking-widest">Avg_PnL</div>
               <div className={`text-xl md:text-2xl font-bold font-mono ${totalPnL >= 0 ? 'text-mint' : 'text-red-500'}`}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}%
               </div>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 border border-[#1c1d24] flex items-center justify-center text-mint bg-mint/5">
               <TrendingUp size={20} className="md:w-6 md:h-6" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3">
            <div className="md:border border-[#1c1d24] md:bg-[#08090d] overflow-hidden">
               {/* Desktop Table View */}
               <table className="hidden md:table w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[#0c0d12] border-b border-[#1c1d24]">
                        <th className="p-5 text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest">Asset_Identifier</th>
                        <th className="p-5 text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest">Entry_Node</th>
                        <th className="p-5 text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest text-right">Performance</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c1d24]">
                     {loading ? (
                        <tr><td colSpan={3} className="p-20 text-center animate-pulse text-[#4a4b52] font-mono text-[10px]">Loading_Positions...</td></tr>
                     ) : trackedTokens.length > 0 ? trackedTokens.map((token) => (
                       <tr key={token._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-5">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-black border border-[#1c1d24] flex items-center justify-center text-white text-[10px] font-bold">
                                   {token.symbol[0]}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[12px] font-bold text-white uppercase">{token.name}</span>
                                   <span className="text-[8px] font-mono text-[#4a4b52] uppercase">{token.symbol} • {token.chain.toUpperCase()}</span>
                                </div>
                             </div>
                          </td>
                          <td className="p-5">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-[#a4a5ab]">${token.entryPrice.toFixed(8)}</span>
                                <span className="text-[7px] font-mono text-[#4a4b52] uppercase">Detected: {new Date(token.createdAt).toLocaleDateString()}</span>
                             </div>
                          </td>
                          <td className="p-5 text-right">
                             <div className="flex flex-col items-end">
                                <span className={`text-[11px] font-mono font-bold ${calculatePnL(token.entryPrice, currentPrices[token.tokenAddress] || token.entryPrice) >= 0 ? 'text-mint' : 'text-red-500'}`}>
                                   {calculatePnL(token.entryPrice, currentPrices[token.tokenAddress] || token.entryPrice).toFixed(2)}%
                                </span>
                                <span className="text-[8px] font-mono text-[#4a4b52] uppercase">Price: ${(currentPrices[token.tokenAddress] || token.entryPrice).toFixed(8)}</span>
                             </div>
                          </td>
                       </tr>
                     )) : (
                       <tr>
                          <td colSpan={3} className="p-20 text-center text-[#4a4b52] uppercase text-[9px] font-mono tracking-widest">
                             No alpha positions detected yet.
                          </td>
                       </tr>
                     )}
                  </tbody>
               </table>

               {/* Mobile Card View */}
               <div className="md:hidden space-y-4">
                  {loading ? (
                    <div className="p-10 text-center animate-pulse text-[#4a4b52] font-mono text-[10px]">Loading_Positions...</div>
                  ) : trackedTokens.length > 0 ? trackedTokens.map((token) => (
                    <div key={token._id} className="pixel-card bg-[#08090d] border border-[#1c1d24] p-4 flex flex-col gap-4">
                       <div className="flex items-center justify-between border-b border-[#1c1d24] pb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-black border border-[#1c1d24] flex items-center justify-center text-white text-[10px] font-bold">
                                {token.symbol[0]}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-white uppercase">{token.name}</span>
                                <span className="text-[8px] font-mono text-[#4a4b52] uppercase">{token.symbol} • {token.chain.toUpperCase()}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className={`text-[12px] font-mono font-bold ${calculatePnL(token.entryPrice, currentPrices[token.tokenAddress] || token.entryPrice) >= 0 ? 'text-mint' : 'text-red-500'}`}>
                                {calculatePnL(token.entryPrice, currentPrices[token.tokenAddress] || token.entryPrice).toFixed(2)}%
                             </span>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <div className="text-[7px] font-mono text-[#4a4b52] uppercase mb-1">Entry_Price</div>
                             <div className="text-[10px] font-mono text-white">${token.entryPrice.toFixed(8)}</div>
                          </div>
                          <div className="text-right">
                             <div className="text-[7px] font-mono text-[#4a4b52] uppercase mb-1">Current_Price</div>
                             <div className="text-[10px] font-mono text-white">${(currentPrices[token.tokenAddress] || token.entryPrice).toFixed(8)}</div>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-[#4a4b52] uppercase text-[9px] font-mono border border-[#1c1d24] border-dashed">
                       No alpha positions detected yet.
                    </div>
                  )}
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-[#08090d] border border-[#1c1d24] p-6 space-y-6">
               <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] border-b border-[#1c1d24] pb-3">Session_Stats</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-mono text-[#4a4b52] uppercase">Total_Tracked</span>
                     <span className="text-[10px] font-mono text-white">{trackedTokens.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-mono text-[#4a4b52] uppercase">Winning_Rate</span>
                     <span className="text-[10px] font-mono text-mint">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-mono text-[#4a4b52] uppercase">Highest_ROI</span>
                     <span className="text-[10px] font-mono text-mint">+12.0%</span>
                  </div>
               </div>
            </div>

            <div className="bg-mint/5 border border-mint/20 p-6">
               <div className="flex items-center gap-3 mb-3">
                  <DollarSign size={16} className="text-mint" />
                  <h4 className="text-[10px] font-bold text-mint uppercase tracking-[0.2em]">Alpha_Simulation</h4>
               </div>
               <p className="text-[9px] font-mono text-[#a4a5ab] leading-relaxed">
                  PnL is calculated based on real-time price feeds from Birdeye Oracle. Values are simulated for tracking performance only.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
