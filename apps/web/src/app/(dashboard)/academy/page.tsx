'use client';

import { HelpCircle, BookOpen, Shield, BarChart3, Zap } from 'lucide-react';

export default function AcademyPage() {
  const articles = [
    { 
      title: 'The "Pump.fun" Migration Alpha', 
      icon: <Zap size={20} />, 
      content: 'When a token on Pump.fun reaches its bonding curve limit (typically 85 SOL), it migrates to Raydium. Our specialized nodes detect the exact millisecond this liquidity bridge is formed, allowing you to capture the initial price discovery phase on the open market.',
      difficulty: 'INTERMEDIATE',
      ref: 'CAT-001'
    },
    { 
      title: 'Security Score Matrix', 
      icon: <Shield size={20} />, 
      content: 'Birdeye composite security scores are calculated using 12 distinct vectors including: Top 10 holder concentration, mint authority status, and freeze account permissions. A Catalyst kural with "Security > 80" effectively filters out 95% of current Solana rugpulls.',
      difficulty: 'BEGINNER',
      ref: 'CAT-002'
    },
    { 
      title: 'Liquidity Drain Mechanics', 
      icon: <BarChart3 size={20} />, 
      content: 'Identifying "Ghost Liquidity" is crucial. Our Liquidity Drain trigger monitors the ratio between total liquidity and 24h volume. Sudden spikes in volume accompanied by stagnating liquidity often signal an incoming exit event.',
      difficulty: 'ADVANCED',
      ref: 'CAT-003'
    },
    { 
      title: 'Whale Radar Strategy', 
      icon: <BookOpen size={20} />, 
      content: 'Smart money leaves footprints. The Whale Radar blueprint identifies transactions exceeding the median daily volume by 500%. This typically indicates institutional accumulation before a major trending event.',
      difficulty: 'BEGINNER',
      ref: 'CAT-004'
    }
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1c1d24] pb-8">
         <div className="space-y-2 md:space-y-1">
           <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tighter">Catalyst Academy</h3>
           <p className="text-[10px] md:text-[11px] font-mono text-[#4a4b52] max-w-md">Technical documentation and execution strategies for the Catalyst Node network.</p>
         </div>
         <div className="text-[9px] md:text-[10px] font-mono text-[#4a4b52] flex items-center gap-2 border border-[#1c1d24] px-3 py-1 bg-[#08090d] w-fit">
            DOC_VERSION: <span className="text-white font-bold">v2.0.4-STABLE</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {articles.map((article) => (
           <div key={article.title} className="bg-[#08090d] border border-[#1c1d24] p-8 space-y-6 group hover:border-mint transition-all">
              <div className="flex justify-between items-start">
                 <div className="w-12 h-12 bg-black border border-[#1c1d24] flex items-center justify-center text-mint group-hover:shadow-glow transition-all">
                    {article.icon}
                 </div>
                 <div className="text-right">
                    <div className="text-[8px] font-mono text-[#4a4b52] uppercase">Level</div>
                    <div className="text-[10px] font-mono text-white">{article.difficulty}</div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-lg font-bold text-white uppercase tracking-tight">{article.title}</h4>
                 <p className="text-[11px] font-mono text-[#a4a5ab] leading-relaxed">
                    {article.content}
                 </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-[#1c1d24]">
                 <span className="text-[9px] font-mono text-mint uppercase font-bold tracking-widest">Learn_More_...</span>
                 <span className="text-[8px] font-mono text-[#4a4b52] uppercase">REF_ID: {article.ref}</span>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
