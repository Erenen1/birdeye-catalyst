'use client';

import { ChevronRight, Zap } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleLaunchClick = (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault();
      openConnectModal?.();
    }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden grid-bg">
      <div className="scanline"></div>
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 md:pt-10 pb-16 md:pb-20 relative z-10 text-center">
        {/* Glowing Icon Container */}
        <div className="w-12 h-12 md:w-16 md:h-16 bg-[#0d0e12] border border-[#1c1d24] flex items-center justify-center mb-8 md:mb-10 shadow-mint-glow relative">
           <Zap size={24} className="text-mint fill-mint/20 md:w-8 md:h-8" />
           <div className="absolute inset-0 bg-mint/5 animate-pulse"></div>
        </div>

        <h1 className="max-w-4xl text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white leading-[1.2] md:leading-[1.15] mb-6">
          Automate your on-chain alpha with <br className="hidden sm:block"/>
          <span className="text-mint">Birdeye Catalyst precision.</span>
        </h1>

        <p className="max-w-xl text-[#849587] text-[11px] md:text-[13px] font-mono mb-10 leading-relaxed uppercase tracking-wide">
          The autonomous event router powered by Birdeye. Set triggers for new listings 
          and trending entries with near-zero latency.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0">
           <button 
              onClick={handleLaunchClick}
              className="w-full sm:w-auto px-8 py-4 md:py-3 bg-mint text-black font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:brightness-110 shadow-glow transition-all"
           >
              Launch_Dashboard <ChevronRight size={14} />
           </button>
           <button className="text-[#4a4b52] hover:text-white font-mono text-[11px] uppercase tracking-widest border-b border-[#1c1d24] pb-1 transition-all">
              View Documentation
           </button>
        </div>
      </div>

      {/* Terminal Window Overlay */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-20 overflow-hidden">
         <div className="bg-[#121318] border border-[#1c1d24] shadow-2xl rounded-sm overflow-hidden flex flex-col">
            {/* Terminal Header */}
            <div className="h-8 bg-[#08090d] border-b border-[#1c1d24] flex items-center px-4 justify-between shrink-0">
               <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-[#1c1d24]"></div>
                  <div className="w-2 h-2 bg-[#1c1d24]"></div>
                  <div className="w-2 h-2 bg-[#1c1d24]"></div>
               </div>
               <div className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest">Sys.Log</div>
               <div className="flex gap-3">
                  <div className="w-2 h-px bg-[#4a4b52]"></div>
                  <div className="w-2 h-2 border border-[#4a4b52]"></div>
                  <div className="w-2 h-2 text-[#4a4b52] leading-[6px] text-center text-[10px]">×</div>
               </div>
            </div>
            
            {/* Terminal Body */}
            <div className="p-4 md:p-6 font-mono text-[9px] md:text-[11px] space-y-2.5 min-h-[220px] overflow-x-hidden">
               <div className="flex gap-2 md:gap-4 items-center">
                  <span className="text-[#4a4b52] w-16 md:w-20 shrink-0">[14:12:05]</span>
                  <span className="text-mint font-bold uppercase w-8 md:w-10 shrink-0">Info</span>
                  <span className="text-[#849587] truncate sm:whitespace-normal">Catalyst sequence initiated.</span>
               </div>
               <div className="flex gap-2 md:gap-4 items-center">
                  <span className="text-[#4a4b52] w-16 md:w-20 shrink-0">[14:12:06]</span>
                  <span className="text-mint font-bold uppercase w-8 md:w-10 shrink-0">Info</span>
                  <span className="text-[#849587] truncate sm:whitespace-normal">Birdeye WebSocket established: <span className="text-white">solana</span></span>
               </div>
               <div className="flex gap-2 md:gap-4 items-center">
                  <span className="text-[#4a4b52] w-16 md:w-20 shrink-0">[14:12:08]</span>
                  <span className="text-amber font-bold uppercase w-8 md:w-10 shrink-0">Warn</span>
                  <span className="text-[#849587] truncate sm:whitespace-normal">High volatility in <span className="text-amber">SOL/USDC</span>.</span>
               </div>
               <div className="flex gap-2 md:gap-4 items-center">
                  <span className="text-[#4a4b52] w-16 md:w-20 shrink-0">[14:12:12]</span>
                  <span className="text-mint font-bold uppercase w-8 md:w-10 shrink-0">Info</span>
                  <span className="text-[#849587] truncate sm:whitespace-normal">Filter matched: <span className="text-white">MIN_LIQ_50K</span></span>
               </div>
               <div className="flex gap-2 md:gap-4 items-center">
                  <span className="text-[#4a4b52] w-16 md:w-20 shrink-0">[14:12:12]</span>
                  <span className="text-blue-400 font-bold uppercase w-8 md:w-10 shrink-0">Exec</span>
                  <span className="text-[#849587] truncate sm:whitespace-normal">Routing payload to Telegram...</span>
               </div>
               <div className="pt-4 border-t border-[#1c1d24] mt-4 flex justify-between items-center">
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <span className="text-[7px] md:text-[8px] text-[#4a4b52] uppercase tracking-tighter md:tracking-normal">Packets_Sent</span>
                        <span className="text-white">1.2k</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[7px] md:text-[8px] text-[#4a4b52] uppercase tracking-tighter md:tracking-normal">Latency</span>
                        <span className="text-mint">14ms</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-mint rounded-full animate-pulse"></div>
                     <span className="text-[8px] md:text-[9px] text-mint uppercase tracking-widest font-bold hidden xs:inline">Live_Router_Active</span>
                     <span className="text-[8px] text-mint uppercase tracking-widest font-bold xs:hidden">LIVE</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      
      {/* Subtle Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-mint/5 blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px]"></div>
      </div>
    </div>
  );
}
