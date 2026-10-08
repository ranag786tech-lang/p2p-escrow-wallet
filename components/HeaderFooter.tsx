'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRightLeft, ShieldCheck, Zap, Lock } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <ArrowRightLeft className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">MicroP2P</span>
            <span className="text-emerald-400 font-semibold text-xs ml-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">PKR ➔ USDT</span>
          </div>
        </Link>

        <nav className="flex items-center space-x-4 sm:space-x-6">
          <Link
            href="/order/track"
            className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Track Order</span>
          </Link>

          <Link
            href="/admin"
            className="text-xs sm:text-sm font-medium px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Admin Portal</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Micro Crypto P2P Exchange Pakistan</span>
        </div>
        <div className="flex items-center space-x-6 text-slate-400">
          <span>Supported: JazzCash, Easypaisa, Bank Transfer</span>
          <span>Network: TRC-20 (TRON)</span>
        </div>
        <div>
          &copy; {year} MicroP2P. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
