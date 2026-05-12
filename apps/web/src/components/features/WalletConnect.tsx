'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';

// Truncate a Solana base58 address for display
function truncateAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

// Inline wallet modal (no external UI library needed)
function WalletModal({ onClose }: { onClose: () => void }) {
  const { wallets, select, connecting } = useWallet();
  const readyWallets = wallets.filter(w => w.readyState === 'Installed' || w.readyState === 'Loadable');
  const otherWallets = wallets.filter(w => w.readyState === 'NotDetected');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-sm bg-[#0c0d12] border border-[#1c1d24] p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold uppercase tracking-widest text-[11px]">Connect Solana Wallet</h2>
            <p className="text-[#4a4b52] font-mono text-[9px] uppercase mt-0.5">Select your wallet to continue</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#4a4b52] hover:text-white text-[16px] leading-none transition-all"
          >
            ×
          </button>
        </div>

        {/* Detected Wallets */}
        {readyWallets.length > 0 && (
          <div className="space-y-2 mb-4">
            <p className="text-[8px] font-mono text-mint uppercase tracking-widest mb-2">Detected</p>
            {readyWallets.map(wallet => (
              <button
                key={wallet.adapter.name}
                onClick={() => { select(wallet.adapter.name); onClose(); }}
                disabled={connecting}
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#1c1d24] hover:border-mint/50 bg-[#121318] hover:bg-mint/5 transition-all group"
              >
                {wallet.adapter.icon && (
                  <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-5 h-5 rounded-sm" />
                )}
                <span className="text-white font-mono text-[11px] font-bold">{wallet.adapter.name}</span>
                <span className="ml-auto text-[8px] text-mint uppercase font-mono tracking-widest">Ready</span>
              </button>
            ))}
          </div>
        )}

        {/* Not Installed Wallets */}
        {otherWallets.length > 0 && (
          <div className="space-y-2">
            <p className="text-[8px] font-mono text-[#4a4b52] uppercase tracking-widest mb-2">Not Installed</p>
            {otherWallets.map(wallet => (
              <a
                key={wallet.adapter.name}
                href={wallet.adapter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 border border-[#1c1d24] bg-[#0c0d12] hover:border-[#1c1d24] transition-all opacity-50 hover:opacity-70"
              >
                {wallet.adapter.icon && (
                  <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-5 h-5 rounded-sm grayscale" />
                )}
                <span className="text-[#849587] font-mono text-[11px]">{wallet.adapter.name}</span>
                <span className="ml-auto text-[8px] text-[#4a4b52] uppercase font-mono tracking-widest">Install →</span>
              </a>
            ))}
          </div>
        )}

        {readyWallets.length === 0 && otherWallets.length === 0 && (
          <p className="text-[#4a4b52] font-mono text-[10px] text-center py-8 uppercase">
            No wallets detected. Install Phantom or Solflare.
          </p>
        )}
      </div>
    </div>
  );
}

export function WalletConnect() {
  const { wallet, publicKey, disconnect, connecting, connected } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = useCallback(() => {
    if (!connected) setShowModal(true);
  }, [connected]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  if (connecting) {
    return (
      <button className="px-5 py-1.5 text-[9px] font-mono uppercase tracking-widest text-mint border border-mint/20 animate-pulse">
        Connecting...
      </button>
    );
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        {/* Solana indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 border border-[#1c1d24] bg-[#0c0d12]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#9945FF]" />
          <span className="text-[8px] font-mono text-[#9945FF] uppercase tracking-widest">SOL</span>
        </div>
        {/* Address */}
        <button
          onClick={handleDisconnect}
          className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-white border border-mint/40 hover:border-red-500/40 hover:text-red-400 transition-all"
          title="Click to disconnect"
        >
          {wallet?.adapter?.icon && (
            <img src={wallet.adapter.icon} alt="" className="inline w-3 h-3 mr-1.5 rounded-sm" />
          )}
          {truncateAddress(publicKey.toBase58())}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleConnect}
        className="px-5 py-1.5 text-[9px] font-mono uppercase tracking-widest text-[#4a4b52] border border-[#1c1d24] hover:text-white hover:border-mint/50 transition-all"
      >
        Connect_Wallet
      </button>
      {showModal && <WalletModal onClose={() => setShowModal(false)} />}
    </>
  );
}
