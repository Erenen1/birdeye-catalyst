'use client';

import { X, Trash2, AlertTriangle, ChevronRight } from 'lucide-react';

interface DeleteConfirmModalProps {
  ruleName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({ ruleName, onClose, onConfirm }: DeleteConfirmModalProps) {
  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-surface border border-red-500/20 relative shadow-[0_0_100px_rgba(239,68,68,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-[#1c1d24]">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 border border-red-500/20 flex items-center justify-center text-red-500">
                <AlertTriangle size={16} />
             </div>
             <div>
                <h3 className="text-lg font-bold uppercase tracking-widest text-red-500 leading-none">Confirm Deletion</h3>
                <span className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-[0.2em]">Destructive Action</span>
             </div>
          </div>
          <button onClick={onClose} className="text-[#4a4b52] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="recessed-box py-4 px-5 bg-red-500/5 border-red-500/10">
             <p className="text-[11px] font-mono text-on-surface-variant leading-relaxed text-center">
               Are you sure you want to terminate the automation node: <br/>
               <span className="text-white font-bold mt-1 block">[{ruleName}]</span>
             </p>
          </div>

          <p className="text-[9px] font-mono text-[#4a4b52] uppercase tracking-widest text-center">
            This action cannot be undone. All associated triggers will be purged.
          </p>

          <div className="flex justify-center gap-4 pt-2">
             <button 
               onClick={onClose}
               className="px-8 py-2 border border-[#1c1d24] text-[9px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
             >
               Abort
             </button>
             <button 
               onClick={onConfirm}
               className="bg-red-500 text-white px-8 py-2 flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] hover:brightness-110 shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all"
             >
               Delete_Node <Trash2 size={12} />
             </button>
          </div>
        </div>

        {/* Footer info line */}
        <div className="h-1 bg-red-500/20 w-full">
           <div className="h-full bg-red-500 w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
