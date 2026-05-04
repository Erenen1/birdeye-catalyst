'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, Bell, LayoutDashboard, Zap, Database, Terminal, FileText, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { WalletConnect } from '@/components/features/WalletConnect';
import { useAccount } from 'wagmi';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { address, isConnected, isConnecting } = useAccount();
  const router = useRouter();
  const [ruleCount, setRuleCount] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dashboard koruması
  useEffect(() => {
    if (isMounted && !isConnecting && !isConnected) {
      router.replace('/');
    }
  }, [isConnected, isConnecting, isMounted, router]);

  const fetchCount = useCallback(async () => {
    if (!address) {
      setRuleCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/rules?userId=${address}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRuleCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching rule count:', error);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected) {
      fetchCount();
      const interval = setInterval(fetchCount, 10000);
      return () => clearInterval(interval);
    }
  }, [fetchCount, isConnected]);

  // Yükleme veya bağlantı yoksa içeriği gösterme
  if (!isMounted || isConnecting || !isConnected) {
    return (
      <div className="h-screen w-screen bg-[#08090d] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-mint border-t-transparent animate-spin"></div>
          <div className="text-mint text-[10px] tracking-[0.3em] uppercase animate-pulse">
            Authenticating_Session...
          </div>
        </div>
      </div>
    );
  }

  const usagePercent = (ruleCount / 3) * 100;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-on-surface overflow-hidden">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-14 flex-col items-center py-5 border-r border-[#1c1d24] bg-[#08090d]">
        <Link href="/" className="mb-8 text-mint">
           <div className="w-6 h-6 grid grid-cols-2 gap-0.5 p-0.5 border border-mint/20">
              <div className="bg-mint/40 w-full h-full"></div>
              <div className="bg-mint w-full h-full"></div>
              <div className="bg-mint w-full h-full"></div>
              <div className="bg-mint/40 w-full h-full"></div>
           </div>
        </Link>
        
        <nav className="flex flex-col gap-6 flex-1">
          <Link href="/dashboard" className={`w-10 h-10 flex items-center justify-center transition-all relative group ${pathname === '/dashboard' ? 'bg-mint text-black shadow-glow' : 'text-[#4a4b52] hover:text-white'}`}>
            <LayoutDashboard size={18} />
            {pathname === '/dashboard' && <div className="absolute -right-[15px] w-1 h-4 bg-mint"></div>}
            <div className="absolute inset-0 border border-mint/0 group-hover:border-mint/20 transition-all"></div>
          </Link>
          <Link href="/terminal" className={`w-10 h-10 flex items-center justify-center transition-all relative group ${pathname === '/terminal' ? 'bg-mint text-black shadow-glow' : 'text-[#4a4b52] hover:text-white'}`}>
            <Zap size={18} />
            {pathname === '/terminal' && <div className="absolute -right-[15px] w-1 h-4 bg-mint"></div>}
            <div className="absolute inset-0 border border-mint/0 group-hover:border-mint/20 transition-all"></div>
          </Link>
          <Link href="/blueprint" className={`w-10 h-10 flex items-center justify-center transition-all relative group ${pathname === '/blueprint' ? 'bg-mint text-black shadow-glow' : 'text-[#4a4b52] hover:text-white'}`}>
            <Database size={18} />
            {pathname === '/blueprint' && <div className="absolute -right-[15px] w-1 h-4 bg-mint"></div>}
            <div className="absolute inset-0 border border-mint/0 group-hover:border-mint/20 transition-all"></div>
          </Link>
          <Link href="/portfolio" className={`w-10 h-10 flex items-center justify-center transition-all relative group ${pathname === '/portfolio' ? 'bg-mint text-black shadow-glow' : 'text-[#4a4b52] hover:text-white'}`}>
            <Terminal size={18} />
            {pathname === '/portfolio' && <div className="absolute -right-[15px] w-1 h-4 bg-mint"></div>}
            <div className="absolute inset-0 border border-mint/0 group-hover:border-mint/20 transition-all"></div>
          </Link>
          <Link href="/academy" className={`w-10 h-10 flex items-center justify-center transition-all relative group ${pathname === '/academy' ? 'bg-mint text-black shadow-glow' : 'text-[#4a4b52] hover:text-white'}`}>
            <HelpCircle size={18} />
            {pathname === '/academy' && <div className="absolute -right-[15px] w-1 h-4 bg-mint"></div>}
            <div className="absolute inset-0 border border-mint/0 group-hover:border-mint/20 transition-all"></div>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-[#1c1d24] flex items-center px-4 md:px-8 justify-between bg-[#08090d] z-20">
          <div className="flex items-center gap-2 md:gap-2.5">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-mint rotate-45 flex items-center justify-center">
               <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-black -rotate-45"></div>
            </div>
            <h1 className="text-xs md:text-sm font-bold tracking-[0.1em] md:tracking-[0.2em] text-mint uppercase">Catalyst</h1>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex items-center gap-3">
               <span className="text-[9px] font-mono text-[#4a4b52] tracking-widest uppercase">Usage:</span>
               <span className="text-[9px] font-mono text-white">{ruleCount}/3</span>
               <div className="progress-bar-container w-16 md:w-24">
                  <div className="progress-bar-fill" style={{ width: `${usagePercent}%` }}></div>
               </div>
            </div>

            <div className="flex items-center gap-3 text-[#4a4b52]">
              <Settings size={14} className="hover:text-white cursor-pointer hidden xs:block" />
              <Bell size={14} className="hover:text-white cursor-pointer" />
            </div>

            <div className="flex items-center gap-2">
               <WalletConnect />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background p-4 md:p-10">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#08090d] border-t border-[#1c1d24] flex items-center justify-around px-2 z-30">
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-mint' : 'text-[#4a4b52]'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-mono uppercase tracking-tighter">Nodes</span>
        </Link>
        <Link href="/terminal" className={`flex flex-col items-center gap-1 ${pathname === '/terminal' ? 'text-mint' : 'text-[#4a4b52]'}`}>
          <Zap size={20} />
          <span className="text-[8px] font-mono uppercase tracking-tighter">Terminal</span>
        </Link>
        <Link href="/blueprint" className={`flex flex-col items-center gap-1 ${pathname === '/blueprint' ? 'text-mint' : 'text-[#4a4b52]'}`}>
          <Database size={20} />
          <span className="text-[8px] font-mono uppercase tracking-tighter">Blueprint</span>
        </Link>
        <Link href="/portfolio" className={`flex flex-col items-center gap-1 ${pathname === '/portfolio' ? 'text-mint' : 'text-[#4a4b52]'}`}>
          <Terminal size={20} />
          <span className="text-[8px] font-mono uppercase tracking-tighter">Alpha</span>
        </Link>
        <Link href="/academy" className={`flex flex-col items-center gap-1 ${pathname === '/academy' ? 'text-mint' : 'text-[#4a4b52]'}`}>
          <HelpCircle size={20} />
          <span className="text-[8px] font-mono uppercase tracking-tighter">Academy</span>
        </Link>
      </nav>
    </div>

  );
}
