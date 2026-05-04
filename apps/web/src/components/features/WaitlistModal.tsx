'use client';

import { useState } from 'react';
import { X, AlertTriangle, Infinity, Zap, Database, Send, CheckCircle2, ChevronRight } from 'lucide-react';

interface WaitlistModalProps {
  onClose: () => void;
}

export default function WaitlistModal({ onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-background/95 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl h-full md:h-auto bg-surface border border-[#1c1d24] relative shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-[#1c1d24]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 border border-mint/20 flex items-center justify-center text-mint">
                <AlertTriangle size={16} />
             </div>
             <div>
                <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-mint leading-none">Access Restricted</h3>
                <span className="text-[8px] md:text-[9px] font-mono text-[#4a4b52] uppercase tracking-[0.2em]">Rule Limit Reached</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#4a4b52] hover:text-white transition-colors">
            <X size={24} className="md:w-5 md:h-5" />
          </button>
        </div>

        {!submitted ? (
          <div className="p-5 md:p-6 space-y-6">
            <div className="recessed-box py-3 px-5 flex flex-col sm:flex-row justify-between items-center gap-3 border-amber/20">
               <span className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest">Current Status</span>
               <span className="text-[10px] font-mono text-amber tracking-widest bg-amber/5 px-2 py-0.5 border border-amber/20 uppercase">Limit Hit: 3/3 Rules</span>
            </div>

            <p className="text-[11px] font-mono text-on-surface-variant leading-relaxed">
              Enterprise-grade features (Webhooks, Unlimited Rules, Priority Execution) require a Pro Tier subscription. Join the waitlist for global deployment.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {[
                 { icon: Database, label: 'Webhooks' },
                 { icon: Infinity, label: 'Unlimited Rules' },
                 { icon: Zap, label: 'Priority Exec' }
               ].map((item, i) => (
                 <div key={i} className="border border-[#1c1d24] p-4 flex flex-row sm:flex-col items-center justify-center gap-3 bg-[#08090d]">
                    <item.icon size={16} className="text-[#4a4b52]" />
                    <span className="text-[8px] font-mono text-white uppercase tracking-widest text-center">{item.label}</span>
                 </div>
               ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-3 border-t border-[#1c1d24]">
               <div className="space-y-2">
                 <label className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest">Operator Email</label>
                 <div className="relative">
                    <Send size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4b52]" />
                    <input 
                      type="email"
                      required
                      placeholder="admin@defi-auto.pro"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#08090d] border border-[#1c1d24] py-3 md:py-2 pl-10 pr-4 text-[12px] font-mono text-white focus:outline-none focus:border-mint transition-colors"
                    />
                 </div>
               </div>
               
               <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 md:py-2 border border-[#1c1d24] text-[9px] font-bold uppercase tracking-widest hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto bg-mint text-black px-6 py-3 md:py-2 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[9px] hover:brightness-110"
                  >
                    Join Waitlist <ChevronRight size={12} />
                  </button>
               </div>
            </form>
          </div>
        ) : (
          <div className="p-8 md:p-12 text-center space-y-6">
            <div className="w-12 h-12 bg-mint text-black mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(0,255,159,0.3)]">
               <CheckCircle2 size={24} />
            </div>
            <div className="space-y-2">
               <h3 className="text-lg font-bold uppercase tracking-widest text-white">Application Received</h3>
               <p className="text-[10px] font-mono text-[#4a4b52] leading-relaxed max-w-xs mx-auto">
                 Your operator ID has been added to the priority sequence.<br className="hidden sm:block"/>Awaiting network clearance.
               </p>
            </div>
            <button 
              onClick={onClose}
              className="w-full sm:w-auto mt-6 px-10 py-3 md:py-2.5 border border-mint text-mint text-[9px] font-bold uppercase tracking-widest hover:bg-mint hover:text-black transition-all"
            >
              Return_to_Console
            </button>
          </div>
        )}
      </div>
    </div>

  );
}
