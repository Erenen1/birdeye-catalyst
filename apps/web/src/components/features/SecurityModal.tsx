'use client';

import { X, ShieldCheck, ShieldAlert, Lock, Unlock, Users, Droplets } from 'lucide-react';

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
  // Radar chart points (normalized 0-100)
  const stats = [
    { label: 'Security', value: data.securityScore },
    { label: 'Mint', value: data.mintAuthority ? 0 : 100 },
    { label: 'Freeze', value: data.freezeAuthority ? 0 : 100 },
    { label: 'Distribution', value: Math.max(0, 100 - (data.top10HolderPercent || 0)) },
    { label: 'Liquidity', value: Math.min(100, (data.liquidity / 50000) * 100) }
  ];

  // SVG Radar Chart Logic
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;
  
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / stats.length - Math.PI / 2;
    const r = (radius * value) / 100;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const points = stats.map((s, i) => getPoint(i, s.value));
  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');
  
  // Background pentagons
  const bgPolygons = [20, 40, 60, 80, 100].map(v => 
    stats.map((_, i) => getPoint(i, v)).map(p => `${p.x},${p.y}`).join(' ')
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      <div className="w-full max-w-md h-full md:h-auto bg-[#08090d] border-t md:border border-[#1c1d24] p-6 md:p-8 relative overflow-y-auto">
        {/* Background Glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] ${data.securityScore > 70 ? 'bg-mint/20' : 'bg-red-500/20'}`}></div>

        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-[#4a4b52] hover:text-white transition-colors">
          <X size={24} className="md:w-5 md:h-5" />
        </button>

        <div className="space-y-6 md:space-y-8 relative">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white uppercase tracking-tight">{tokenName}</h3>
            <p className="text-[10px] font-mono text-mint uppercase tracking-[0.2em]">{tokenSymbol} // SAFETY_RADAR_REPORT</p>
          </div>

          {/* Radar Chart Section */}
          <div className="flex justify-center py-2 md:py-4">
             <div className="relative w-[180px] h-[180px] md:w-[200px] md:h-[200px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
                   {/* Background Grid */}
                   {bgPolygons.map((path, i) => (
                     <polygon key={i} points={path} fill="none" stroke="#1c1d24" strokeWidth="1" />
                   ))}
                   {/* Axes */}
                   {stats.map((_, i) => {
                     const p = getPoint(i, 100);
                     return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#1c1d24" strokeWidth="1" />;
                   })}
                   {/* Data Polygon */}
                   <polygon 
                     points={polygonPath} 
                     fill={data.securityScore > 70 ? 'rgba(0, 255, 163, 0.2)' : 'rgba(239, 68, 68, 0.2)'} 
                     stroke={data.securityScore > 70 ? '#00ffa3' : '#ef4444'} 
                     strokeWidth="2" 
                     className="animate-in zoom-in duration-700"
                   />
                   {/* Labels */}
                   {stats.map((s, i) => {
                     const p = getPoint(i, 115);
                     return (
                       <text 
                         key={i} 
                         x={p.x} 
                         y={p.y} 
                         textAnchor="middle" 
                         className="text-[8px] font-mono fill-[#4a4b52] uppercase font-bold"
                       >
                         {s.label}
                       </text>
                     );
                   })}
                </svg>
             </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
             <div className="p-4 bg-black/40 border border-[#1c1d24] space-y-2">
                <div className="flex items-center gap-2 text-[8px] font-mono text-[#4a4b52] uppercase">
                   <ShieldCheck size={10} className="text-mint" /> Security_Score
                </div>
                <div className="text-lg font-bold text-white font-mono">{data.securityScore}/100</div>
             </div>
             <div className="p-4 bg-black/40 border border-[#1c1d24] space-y-2">
                <div className="flex items-center gap-2 text-[8px] font-mono text-[#4a4b52] uppercase">
                   <Users size={10} className="text-amber" /> Top_10_Holders
                </div>
                <div className="text-lg font-bold text-white font-mono">{(data.top10HolderPercent || 0).toFixed(1)}%</div>
             </div>
             <div className="p-4 bg-black/40 border border-[#1c1d24] space-y-2">
                <div className="flex items-center gap-2 text-[8px] font-mono text-[#4a4b52] uppercase">
                   {data.mintAuthority ? <ShieldAlert size={10} className="text-red-500" /> : <Lock size={10} className="text-mint" />} Mint_Authority
                </div>
                <div className={`text-xs font-bold font-mono uppercase ${data.mintAuthority ? 'text-red-500' : 'text-mint'}`}>
                   {data.mintAuthority ? 'ENABLED_⚠️' : 'DISABLED_✅'}
                </div>
             </div>
             <div className="p-4 bg-black/40 border border-[#1c1d24] space-y-2">
                <div className="flex items-center gap-2 text-[8px] font-mono text-[#4a4b52] uppercase">
                   {data.freezeAuthority ? <ShieldAlert size={10} className="text-red-500" /> : <Lock size={10} className="text-mint" />} Freeze_Auth
                </div>
                <div className={`text-xs font-bold font-mono uppercase ${data.freezeAuthority ? 'text-red-500' : 'text-mint'}`}>
                   {data.freezeAuthority ? 'ENABLED_⚠️' : 'DISABLED_✅'}
                </div>
             </div>
          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
             <div className={`w-full h-1 bg-[#1c1d24] relative overflow-hidden`}>
                <div 
                  className={`absolute inset-y-0 left-0 transition-all duration-1000 ${data.securityScore > 70 ? 'bg-mint' : 'bg-red-500'}`}
                  style={{ width: `${data.securityScore}%` }}
                ></div>
             </div>
             <p className="text-[10px] font-mono text-[#4a4b52] uppercase text-center leading-relaxed">
                Automated security scan completed. Catalyst recommendation: <span className={data.securityScore > 70 ? 'text-mint' : 'text-amber'}>
                  {data.securityScore > 80 ? 'HIGH_CONFIDENCE' : data.securityScore > 60 ? 'CAUTION' : 'HIGH_RISK'}
                </span>
             </p>
             <button 
                onClick={onClose}
                className="w-full md:hidden py-3 bg-[#1c1d24] text-white text-[10px] font-bold uppercase tracking-widest mt-2"
             >
                Close Report
             </button>
          </div>
        </div>
      </div>
    </div>

  );
}
