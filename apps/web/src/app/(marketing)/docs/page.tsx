import React from 'react';
import { Terminal, Shield, Zap, Activity, Cpu, Code2, CheckSquare } from 'lucide-react';

export const metadata = {
  title: 'Documentation | Catalyst Terminal',
  description: 'Technical architecture and usage guide for Catalyst Terminal.',,
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#08090d] font-mono text-[#849587] pb-32">
      {/* Docs Header */}
      <div className="pt-32 pb-16 border-b border-[#1c1d24] bg-[#0c0d12]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-mint rotate-45 flex items-center justify-center">
              <div className="w-4 h-4 bg-black -rotate-45"></div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">Catalyst_Manifesto</h1>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed">
            Welcome to the Catalyst Terminal technical documentation. Here you will find detailed explanations of our AI-driven architecture, automated execution nodes, and how to maximize your operational efficiency on the Solana network.
          </p>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row mt-12 px-6 gap-12 relative items-start">
        
        {/* Sticky Sidebar */}
        <div className="w-full md:w-64 shrink-0 md:sticky md:top-32 border-l border-[#1c1d24] pl-4">
          <h3 className="text-[10px] text-white uppercase tracking-widest font-bold mb-6">Table_of_Contents</h3>
          <ul className="space-y-4 text-xs uppercase tracking-wider">
            <li><a href="#introduction" className="hover:text-mint transition-colors">1. Introduction</a></li>
            <li><a href="#architecture" className="hover:text-mint transition-colors">2. System Architecture</a></li>
            <li><a href="#ai-engine" className="hover:text-mint transition-colors">3. AI Transformer Engine</a></li>
            <li><a href="#deploying-nodes" className="hover:text-mint transition-colors">4. Deploying Nodes</a></li>
            <li><a href="#security" className="hover:text-mint transition-colors">5. Security Matrix</a></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-24">
          
          {/* Section 1 */}
          <section id="introduction" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c1d24] pb-4">
              <Terminal size={20} className="text-mint" />
              <h2 className="text-xl font-bold text-white tracking-tighter uppercase">1. Introduction</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Catalyst Terminal is an industrial-grade DeFi intelligence hub. It bridges the gap between raw blockchain data and actionable trading execution. By monitoring thousands of tokens in real-time, it allows operators (users) to set up automated logical nodes that trigger private Telegram notifications the millisecond a token matches their precise criteria.
            </p>
            <div className="bg-[#121318] border border-[#1c1d24] p-6 rounded-sm">
              <h4 className="text-white text-xs font-bold mb-2 uppercase">Core Philosophy</h4>
              <p className="text-xs">Speed is irrelevant without accuracy. Catalyst ensures you only receive signals for high-quality liquidity pools by routing raw data through our dual-layer security and AI prediction network.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="architecture" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c1d24] pb-4">
              <Activity size={20} className="text-mint" />
              <h2 className="text-xl font-bold text-white tracking-tighter uppercase">2. System Architecture</h2>
            </div>
            <p className="text-sm leading-relaxed">
              The platform operates on a robust microservices architecture designed to handle massive data throughput without blocking user interfaces.
            </p>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="text-mint font-bold">[1]</span>
                <div>
                  <strong className="text-white block mb-1">Birdeye Ingestion Engine:</strong> 
                  Pulls real-time WebSocket data for new token listings, trending entries, and whale movements across Solana.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-mint font-bold">[2]</span>
                <div>
                  <strong className="text-white block mb-1">BullMQ Worker Farm:</strong> 
                  Asynchronous Redis-backed workers evaluate active user nodes against the incoming data stream in parallel.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-mint font-bold">[3]</span>
                <div>
                  <strong className="text-white block mb-1">Telegram Dispatcher:</strong> 
                  Formats and pushes sub-second payload notifications securely to user-bound Telegram chats.
                </div>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="ai-engine" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c1d24] pb-4">
              <Cpu size={20} className="text-mint" />
              <h2 className="text-xl font-bold text-white tracking-tighter uppercase">3. AI Transformer Engine</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Every token that triggers a rule is first routed to the Catalyst AI Engine. Written in Python (PyTorch), the engine utilizes a <span className="text-white">Multi-Head Attention Transformer</span> model.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#1c1d24] p-4">
                <div className="text-mint text-[10px] mb-2">INPUT_TENSORS</div>
                <ul className="text-xs space-y-1">
                  <li>- 60-candle Price History</li>
                  <li>- 60-candle Volume History</li>
                  <li>- RSI & MACD Divergence</li>
                  <li>- Smart Money Flow Index</li>
                </ul>
              </div>
              <div className="border border-[#1c1d24] p-4">
                <div className="text-mint text-[10px] mb-2">OUTPUT_PROBABILITIES</div>
                <ul className="text-xs space-y-1">
                  <li>- BULLISH (High continuation)</li>
                  <li>- BEARISH (Likely dump)</li>
                  <li>- HIGH_RISK (Extreme volatility)</li>
                  <li>- NEUTRAL</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-[#4a4b52] italic mt-2">Note: In the event of cold-starts, a fallback heuristic layer calculates baseline technical indicators to ensure 100% uptime.</p>
          </section>

          {/* Section 4 */}
          <section id="deploying-nodes" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c1d24] pb-4">
              <Code2 size={20} className="text-mint" />
              <h2 className="text-xl font-bold text-white tracking-tighter uppercase">4. Deploying Nodes</h2>
            </div>
            <p className="text-sm leading-relaxed">
              A "Node" is an automated rule configuration. To deploy a node, you must set an overarching <strong className="text-white">Trigger</strong> and a set of <strong className="text-white">Conditions</strong>.
            </p>
            <div className="bg-[#121318] p-5 border border-[#1c1d24]">
              <h4 className="text-white text-[11px] uppercase tracking-widest mb-4">Example Configuration</h4>
              <div className="space-y-2 text-xs font-mono text-mint">
                <div>TRIGGER: <span className="text-white">NEW_LISTING</span></div>
                <div>CONDITION_1: <span className="text-white">LIQUIDITY {'>'} $50,000</span></div>
                <div>CONDITION_2: <span className="text-white">SECURITY_SCORE {'>'} 80</span></div>
                <div>ACTION: <span className="text-white">SEND_TELEGRAM_PAYLOAD</span></div>
              </div>
            </div>
            <p className="text-sm">Once deployed, the node runs silently on our worker servers 24/7. PRO users receive alerts with a 10-second priority polling rate.</p>
          </section>

          {/* Section 5 */}
          <section id="security" className="space-y-6">
            <div className="flex items-center gap-3 border-b border-[#1c1d24] pb-4">
              <Shield size={20} className="text-mint" />
              <h2 className="text-xl font-bold text-white tracking-tighter uppercase">5. Security Matrix</h2>
            </div>
            <p className="text-sm leading-relaxed">
              To protect operators from malicious contracts, Catalyst integrates deeply with RugCheck APIs. Every token generates a composite <strong className="text-white">Security Score (0-100)</strong> based on severe risk factors.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><CheckSquare size={14} className="text-mint" /> Honeypot Detection</li>
              <li className="flex items-center gap-2"><CheckSquare size={14} className="text-mint" /> Mint Authority Verification (Is the supply locked?)</li>
              <li className="flex items-center gap-2"><CheckSquare size={14} className="text-mint" /> Freeze Authority Verification</li>
              <li className="flex items-center gap-2"><CheckSquare size={14} className="text-mint" /> Top 10 Holder Concentration Metrics</li>
            </ul>
            <p className="text-xs text-amber mt-4">Disclaimer: A high security score reduces risk but does not eliminate it. Always DYOR. Catalyst is an intelligence tool, not financial advice.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
