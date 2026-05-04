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
