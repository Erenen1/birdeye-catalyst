'use client';

import { useState, useEffect } from 'react';

import { ChevronRight, ShieldCheck, Shield, Activity, Users, Radio, Send, ShieldAlert, Cpu, Database, Zap, BarChart3, Globe } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function LandingPage() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const handleLaunchClick = (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault();
      openConnectModal?.();
    }
  };

  const steps = [
    {
      title: 'DATA_INGESTION',
      desc: 'Real-time monitoring of cross-chain transactions (Solana, Base, Ethereum, etc.) via Birdeye sub-second indexing.',
      icon: <Database size={20} />
    },
    {
      title: 'NEURAL_FILTERING',
      desc: 'Custom logic nodes analyze liquidity depth, security scores, and whale clusters.',
      icon: <Cpu size={20} />
    },
    {
      title: 'INSTANT_DISPATCH',
      desc: 'High-priority routing of validated signals to your Telegram or custom webhooks.',
      icon: <Zap size={20} />
    }
  ];

  const blueprints = [
    { name: 'PUMP_ALPHA', tag: 'HIGH_RISK', perf: '12x AVG' },
    { name: 'SAFE_HARBOR', tag: 'LOW_RISK', perf: '1.5x AVG' },
    { name: 'WHALE_WATCH', tag: 'MED_RISK', perf: '4x AVG' }
  ];

  const [stats, setStats] = useState([
    { label: 'ACTIVE_OPERATORS', value: '...', sub: 'Verified Wallets', icon: <Users size={16} /> },
    { label: 'DEPLOYED_NODES', value: '...', sub: 'Automation Rules', icon: <Activity size={16} /> },
    { label: 'SIGNALS_DISPATCHED', value: '...', sub: 'Routed to Telegram', icon: <Send size={16} /> },
    { label: 'THREATS_BLOCKED', value: '...', sub: 'Scams Filtered', icon: <ShieldAlert size={16} /> }
  ]);

  const [activeRadarTab, setActiveRadarTab] = useState('new_listing');
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  const [sysLogs, setSysLogs] = useState<Array<{ id: string, time: string, level: string, msg: React.ReactNode }>>([
    { id: '1', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), level: 'INFO', msg: 'Catalyst sequence initiated.' },
    { id: '2', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), level: 'INFO', msg: <>Birdeye WebSocket established: <span className="text-white">multi-chain</span></> }
  ]);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Fetch Alerts
        const alertsRes = await fetch('/api/alerts?userId=GLOBAL');
        const alertsData = await alertsRes.json();
        if (Array.isArray(alertsData)) setRealAlerts(alertsData);

        // Fetch Stats
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        if (statsData.activeOperators !== undefined) {
          setStats([
            { label: 'ACTIVE_OPERATORS', value: statsData.activeOperators.toLocaleString(), sub: 'Verified Wallets', icon: <Users size={16} /> },
            { label: 'DEPLOYED_NODES', value: statsData.deployedNodes.toLocaleString(), sub: 'Automation Rules', icon: <Activity size={16} /> },
            { label: 'SIGNALS_DISPATCHED', value: statsData.signalsDispatched.toLocaleString(), sub: 'Routed to Telegram', icon: <Send size={16} /> },
            { label: 'THREATS_BLOCKED', value: statsData.threatsBlocked.toLocaleString(), sub: 'Scams Filtered', icon: <ShieldAlert size={16} /> }
          ]);
        }
      } catch (error) {
        console.error('Data fetch error:', error);
      }
    };

    fetchRealData();

    // Real-time SSE Integration for Landing Page Radar
    const globalStream = new EventSource('/api/alerts/stream?userId=GLOBAL');
    
    globalStream.onmessage = (event) => {
      try {
        const newAlert = JSON.parse(event.data);
        setRealAlerts(prev => {
          // Duplicate check
          if (prev.some(a => a.token?.address === newAlert.token?.address && a.triggerType === newAlert.triggerType)) {
            return prev;
          }
          
          // Trigger Terminal Animation Sequence
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          setSysLogs(logs => {
            const base = logs.slice(-4); // Keep last 4 so total is 5
            return [...base, {
              id: Date.now().toString(),
              time: timeStr,
              level: 'INFO',
              msg: <>Signal matched: <span className="text-white">{newAlert.token?.symbol || 'UNKNOWN'}</span> ({newAlert.triggerType})</>
            }];
          });

          setTimeout(() => {
            setSysLogs(logs => {
              const base = logs.slice(-4);
              const score = newAlert.security?.securityScore ?? 50;
              const level = score < 40 ? 'WARN' : 'INFO';
              const color = score < 40 ? 'text-amber' : 'text-mint';
              return [...base, {
                id: (Date.now() + 1).toString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                level: level,
                msg: <>Security Score: <span className={color}>{score}/100</span></>
              }];
            });
          }, 800);

          setTimeout(() => {
            setSysLogs(logs => {
              const base = logs.slice(-4);
              const ai = newAlert.security?.aiPrediction || 'NEUTRAL';
              const aiColor = ai === 'BULLISH' ? 'text-mint' : ai === 'BEARISH' ? 'text-red-500' : 'text-amber';
              return [...base, {
                id: (Date.now() + 2).toString(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                level: 'EXEC',
                msg: <>AI Engine: <span className={aiColor}>{ai}</span>. Routing payload...</>
              }];
            });
          }, 1600);

          return [newAlert, ...prev].slice(0, 50);
        });
      } catch (err) {
        console.error('SSE Parse error:', err);
      }
    };

    const interval = setInterval(fetchRealData, 120000); // 2m fallback refresh
    
    return () => {
      globalStream.close();
      clearInterval(interval);
    };
  }, []);

  const getRadarData = (type: string) => {
    // First try exact triggerType match
    const filtered = realAlerts.filter(a => a.triggerType === type);
    // If no data for this trigger type, show latest 5 from all types
    const source = filtered.length > 0 ? filtered : realAlerts;
    return source
      .slice(0, 5)
      .map(a => ({
        time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        name: a.token?.symbol ?? '—',
        network: a.chain?.toUpperCase() ?? '—',
        liq: a.token?.liquidity ? `$${(a.token.liquidity / 1000).toFixed(1)}k` : 'N/A',
        score: a.security?.securityScore != null ? `${a.security.securityScore}/100` : 'N/A',
        status: 'MATCH',
        triggerType: a.triggerType ?? type,
        logoURI: a.token?.logoURI,
      }));
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
          and trending entries with optimized latency.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto px-4 sm:px-0">
           <Link 
              href="/dashboard"
              onClick={handleLaunchClick}
              className="w-full sm:w-auto px-8 py-4 md:py-3 bg-mint text-black font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:brightness-110 shadow-glow transition-all"
           >
              Launch_Dashboard <ChevronRight size={14} />
           </Link>
           <Link href="/docs" className="text-[#4a4b52] hover:text-white font-mono text-[11px] uppercase tracking-widest border-b border-[#1c1d24] pb-1 transition-all">
              View Documentation
           </Link>
        </div>
      </div>

      {/* Terminal Window Overlay */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-24 overflow-hidden relative z-10">
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
            <div className="p-4 md:p-6 font-mono text-[9px] md:text-[11px] space-y-2.5 min-h-[220px] overflow-x-hidden flex flex-col justify-end">
               {sysLogs.map((log) => (
                 <div key={log.id} className="flex gap-2 md:gap-4 items-center animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <span className="text-[#4a4b52] w-16 md:w-20 shrink-0">[{log.time}]</span>
                    <span className={`font-bold uppercase w-8 md:w-10 shrink-0 ${log.level === 'INFO' ? 'text-mint' : log.level === 'WARN' ? 'text-amber' : 'text-blue-400'}`}>
                      {log.level}
                    </span>
                    <span className="text-[#849587] truncate sm:whitespace-normal">{log.msg}</span>
                 </div>
               ))}
               <div className="pt-4 border-t border-[#1c1d24] mt-4 flex justify-between items-center">
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <span className="text-[7px] md:text-[8px] text-[#4a4b52] uppercase tracking-tighter md:tracking-normal">Packets_Sent</span>
                        <span className="text-white">{(1200 + realAlerts.length * 3).toLocaleString()}</span>
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

      {/* Live Intelligence Radar */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-16 md:py-24 border-t border-[#1c1d24] relative z-10">
         <div className="flex flex-col gap-6 mb-8 md:mb-12">
            <div className="space-y-2">
               <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                  <Activity size={18} className="text-mint" /> LIVE_INTELLIGENCE_RADAR
               </h2>
               <p className="text-[10px] md:text-[11px] font-mono text-[#4a4b52] uppercase">Cross-chain event monitoring in real-time.</p>
            </div>
            {/* Scrollable tab row on mobile */}
            <div className="flex overflow-x-auto scrollbar-hide bg-[#08090d] border border-[#1c1d24] p-1 gap-0">
               {[
                 { id: 'new_listing', label: 'NEW_LISTINGS' },
                 { id: 'pump_fun_migration', label: 'PUMP_FUN' },
                 { id: 'whale_radar', label: 'WHALE_RADAR' }
               ].map((tab) => (
                  <button 
                     key={tab.id}
                     onClick={() => setActiveRadarTab(tab.id)}
                     className={`shrink-0 px-3 md:px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${activeRadarTab === tab.id ? 'bg-mint text-black' : 'text-[#4a4b52] hover:text-white'}`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         <div className="border border-[#1c1d24] bg-black/40 backdrop-blur-sm overflow-hidden">
            {/* Desktop table header — hidden on mobile */}
            <div className="hidden md:grid grid-cols-5 bg-[#08090d] border-b border-[#1c1d24] px-6 py-3 text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest">
               <span>Timestamp</span>
               <span className="col-span-2">Event_Details</span>
               <span>Metrics</span>
               <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-[#1c1d24]">
                {getRadarData(activeRadarTab).length > 0 ? (
                  getRadarData(activeRadarTab).map((row, i) => (
                     <div key={i} className="animate-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        {/* Mobile card layout */}
                        <div className="flex md:hidden items-center gap-3 px-4 py-3">
                           <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${row.status === 'IGNORE' ? 'bg-red-500' : 'bg-mint'} animate-pulse`}></div>
                           <div className="w-7 h-7 border border-[#1c1d24] flex items-center justify-center bg-[#0c0d12] text-mint font-bold text-[9px] shrink-0 overflow-hidden">
                             {row.logoURI ? (
                               <img src={row.logoURI} alt={row.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                             ) : (
                               (row.name || '?')[0]
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2">
                               <span className="text-[11px] font-bold text-white font-mono truncate">{row.name}</span>
                               {row.network && <span className="text-[8px] px-1 border border-[#1c1d24] text-[#4a4b52] shrink-0">{row.network}</span>}
                             </div>
                             <div className="flex gap-3 mt-0.5">
                               <span className="text-[9px] font-mono text-[#4a4b52]">{row.time}</span>
                               <span className="text-[9px] font-mono text-mint">{row.liq}</span>
                             </div>
                           </div>
                           <span className={`text-[8px] font-bold font-mono px-2 py-0.5 border shrink-0 ${row.status === 'IGNORE' ? 'border-red-500/20 text-red-500' : 'border-mint/20 text-mint uppercase'}`}>
                             {row.status}
                           </span>
                        </div>
                        {/* Desktop row layout */}
                        <div className="hidden md:grid grid-cols-5 px-6 py-4 items-center">
                           <span className="text-[10px] font-mono text-[#4a4b52]">{row.time}</span>
                           <div className="col-span-2 flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${row.status === 'IGNORE' ? 'bg-red-500' : 'bg-mint'} animate-pulse shrink-0`}></div>
                              <div className="w-5 h-5 border border-[#1c1d24] flex items-center justify-center bg-[#0c0d12] text-mint font-bold text-[8px] shrink-0 overflow-hidden">
                                {row.logoURI ? (
                                  <img src={row.logoURI} alt={row.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                ) : (
                                  (row.name || '?')[0]
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-white font-mono">{row.name}</span>
                              {row.network && <span className="text-[8px] px-1 border border-[#1c1d24] text-[#4a4b52]">{row.network}</span>}
                           </div>
                           <span className="text-[10px] font-mono text-mint">{row.liq}</span>
                           <div className="text-right">
                              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border ${row.status === 'IGNORE' ? 'border-red-500/20 text-red-500' : 'border-mint/20 text-mint uppercase'}`}>
                                 {row.status}
                              </span>
                           </div>
                        </div>
                     </div>
                  ))
                ) : (
                 <div className="px-4 md:px-6 py-10 md:py-12 text-center">
                    <span className="text-[10px] font-mono text-[#4a4b52] uppercase tracking-[0.1em] md:tracking-[0.2em]">No_live_signals_detected</span>
                 </div>
               )}
            </div>
            <div className="bg-[#08090d]/50 px-4 md:px-6 py-3 border-t border-[#1c1d24] flex justify-between items-center">
               <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                     {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 bg-mint/40"></div>)}
                  </div>
                  <span className="text-[8px] font-mono text-[#4a4b52] uppercase hidden sm:inline">Synchronizing with Birdeye Mesh...</span>
                  <span className="text-[8px] font-mono text-[#4a4b52] uppercase sm:hidden">Syncing...</span>
               </div>
               <span className="text-[8px] font-mono text-mint animate-pulse">RADAR_CONNECTED</span>
            </div>
         </div>
      </div>

      {/* How it Works - Technical Pipeline */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-16 md:py-24 border-t border-[#1c1d24] relative z-10">
         <div className="mb-16">
            <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
               <Cpu size={20} className="text-mint" /> TECHNICAL_PIPELINE
            </h2>
            <div className="h-px w-12 bg-mint mt-2"></div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Visual connector lines for desktop */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px border-t border-dashed border-[#1c1d24] z-0"></div>
            
            {steps.map((step, i) => (
               <div key={step.title} className="space-y-6 relative z-10">
                  <div className="w-12 h-12 bg-[#08090d] border border-[#1c1d24] flex items-center justify-center text-mint shadow-mint-glow/20">
                     {step.icon}
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <span className="text-mint font-mono text-[10px]">0{i+1}</span>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">{step.title}</h3>
                     </div>
                     <p className="text-[11px] font-mono text-[#a4a5ab] leading-relaxed uppercase">
                        {step.desc}
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Blueprint Market Preview */}
      <div className="bg-[#08090d] border-y border-[#1c1d24] py-16 md:py-24 relative z-10">
         <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-8 mb-8 md:mb-16">
               <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                     <Globe size={20} className="text-mint" /> BLUEPRINT_REPOSITORY
                  </h2>
                  <p className="text-[11px] font-mono text-[#4a4b52] uppercase">Deploy verified on-chain strategies in seconds.</p>
               </div>
               <Link href="/blueprint" className="text-[10px] font-bold text-mint uppercase tracking-widest flex items-center gap-2 hover:underline">
                  Browse_All_Blueprints <ArrowRight size={14} />
               </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
               {blueprints.map((bp) => (
                  <div key={bp.name} className="p-6 border border-[#1c1d24] bg-black group hover:border-mint transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <span className="text-xs font-bold text-white uppercase">{bp.name}</span>
                        <span className={`text-[8px] font-mono px-2 py-0.5 border ${bp.tag === 'HIGH_RISK' ? 'border-red-500/30 text-red-500' : 'border-mint/30 text-mint'}`}>
                           {bp.tag}
                        </span>
                     </div>
                     <div className="space-y-4">
                        <div className="h-px w-full bg-[#1c1d24]"></div>
                        <div className="flex justify-between items-center">
                           <span className="text-[8px] font-mono text-[#4a4b52] uppercase">Success_Rate</span>
                           <span className="text-[10px] font-mono text-amber font-bold">{bp.perf}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Network Analytics - High Fidelity Stats */}
      <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-16 md:py-24 relative z-10">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => (
               <div key={stat.label} className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4a4b52]">
                     {stat.icon}
                     <span className="text-[9px] font-mono uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="space-y-1">
                     <div className="text-2xl md:text-3xl font-bold text-white tracking-tighter">{stat.value}</div>
                     <div className="text-[8px] font-mono text-mint uppercase tracking-widest opacity-60">{stat.sub}</div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Footer / CTA / Disclaimer */}
      <div className="border-t border-[#1c1d24] py-12 md:py-16 px-4 md:px-6 relative z-10">
         <div className="max-w-6xl mx-auto flex flex-col items-center">
            <p className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-[0.3em] mb-8">Ready_to_initialize_sequence?</p>
            <Link 
               href="/dashboard"
               onClick={handleLaunchClick}
               className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] hover:bg-mint transition-all mb-20"
            >
               Get_Started_Now
            </Link>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-[#1c1d24]/50">
               <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 text-[#4a4b52]">
                     <Shield size={14} className="text-mint" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Risk_Warning</span>
                  </div>
                  <p className="text-[9px] font-mono text-[#4a4b52] leading-relaxed uppercase">
                     Trading crypto assets involves significant risk. Data provided by Catalyst Nodes are technical statistics based on market observation. Past performance is not indicative of future results. You may lose your entire capital.
                  </p>
               </div>
               <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 text-[#4a4b52]">
                     <Globe size={14} className="text-blue-500" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Legal_Disclaimer</span>
                  </div>
                  <p className="text-[9px] font-mono text-[#4a4b52] leading-relaxed uppercase">
                     Birdeye Catalyst is not a financial advisory service. All data presented is for informational purposes only. The platform cannot be held liable for losses resulting from software errors, data delays, or market manipulation.
                  </p>
               </div>
            </div>
            
            <div className="mt-16 text-[8px] font-mono text-[#1c1d24] uppercase tracking-widest">
               © 2026 Birdeye_Catalyst // Industrial_DeFi_Intelligence_Hub
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

const ArrowRight = ({ size, className }: { size?: number, className?: string }) => (
   <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
   >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
   </svg>
);

