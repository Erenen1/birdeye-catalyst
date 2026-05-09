'use client';

import Link from 'next/link';
import { WalletConnect } from '@/components/features/WalletConnect';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  // Cüzdan bağlandığında otomatik dashboard'a yönlendir
  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);

  const handleLaunchClick = (e: React.MouseEvent) => {
    if (!isConnected) {
      e.preventDefault();
      openConnectModal?.();
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-[#1c1d24] flex items-center px-4 md:px-10 justify-between bg-[#08090d] z-50 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-mint rotate-45 flex items-center justify-center shrink-0">
             <div className="w-2.5 h-2.5 bg-black -rotate-45"></div>
          </div>
          <h1 className="text-xs md:text-sm font-bold tracking-[0.1em] md:tracking-[0.2em] text-mint uppercase truncate">Birdeye_Catalyst</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          {/* Telegram Community Link */}
          <a
            href="https://t.me/BirdeyeCatalystAlpha"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1c1d24] text-[#4a4b52] hover:bg-[#1da1f2]/10 hover:border-[#1da1f2]/50 hover:text-[#1da1f2] transition-all group"
            title="Join the Birdeye Catalyst Alpha Channel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3 shrink-0"
            >
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            <span className="text-[9px] font-mono tracking-widest uppercase hidden sm:inline">
              TG_Alpha
            </span>
          </a>

          <WalletConnect />
          <button 
             onClick={handleLaunchClick}
             className="hidden sm:block px-5 py-1.5 bg-mint text-black text-[9px] font-bold uppercase tracking-widest hover:brightness-110 whitespace-nowrap"
          >
             Launch_Dashboard
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
