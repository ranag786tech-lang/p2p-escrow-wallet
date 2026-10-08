'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  CreditCard,
  Wallet,
  Sparkles,
  TrendingUp,
  Clock,
  HelpCircle
} from 'lucide-react';

export default function P2PCalculator() {
  const router = useRouter();
  const [rate, setRate] = useState<number>(282.50);
  const [pkrAmount, setPkrAmount] = useState<string>('10000');
  const [usdtAmount, setUsdtAmount] = useState<string>('35.39');
  const [loading, setLoading] = useState<boolean>(true);
  const [minPkr, setMinPkr] = useState<number>(500);
  const [maxPkr, setMaxPkr] = useState<number>(1000000);
  const [notice, setNotice] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');

  const fetchExchangeData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success) {
        setRate(data.rate);
        if (data.settings) {
          setMinPkr(data.settings.minPkr);
          setMaxPkr(data.settings.maxPkr);
          setNotice(data.settings.noticeText);
        }
        if (data.updatedAt) {
          setLastUpdated(new Date(data.updatedAt).toLocaleTimeString());
        }
        // Calculate initial USDT amount
        const numPkr = parseFloat(pkrAmount) || 0;
        setUsdtAmount((numPkr / data.rate).toFixed(2));
      }
    } catch (e) {
      console.error('Failed to load exchange rate:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeData();
  }, []);

  const handlePkrChange = (val: string) => {
    setPkrAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setUsdtAmount((num / rate).toFixed(2));
    } else {
      setUsdtAmount('');
    }
  };

  const handleUsdtChange = (val: string) => {
    setUsdtAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setPkrAmount((num * rate).toFixed(2));
    } else {
      setPkrAmount('');
    }
  };

  const handleQuickAmount = (amount: number) => {
    setPkrAmount(amount.toString());
    setUsdtAmount((amount / rate).toFixed(2));
  };

  const numPkr = parseFloat(pkrAmount) || 0;
  const isValidAmount = numPkr >= minPkr && numPkr <= maxPkr;

  const handleProceed = () => {
    if (!isValidAmount) return;
    router.push(`/order/checkout?pkr=${pkrAmount}&usdt=${usdtAmount}&rate=${rate}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant & Verified P2P Crypto Exchange in Pakistan</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Buy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">USDT</span> with <span className="text-slate-200">JazzCash & Easypaisa</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Secure, low-fee peer-to-peer crypto settlement. Direct TRC-20 wallet transfers verified within minutes.
        </p>
      </div>

      {/* Main Exchange Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Exchange Rate Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Current Exchange Rate</div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                1 USDT = <span className="text-emerald-400">{rate.toFixed(2)} PKR</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 self-end sm:self-auto">
            {lastUpdated && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Updated {lastUpdated}
              </span>
            )}
            <button
              onClick={fetchExchangeData}
              disabled={loading}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all"
              title="Refresh Rate"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Exchange Form Inputs */}
        <div className="space-y-4">
          {/* You Pay (PKR) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 transition-all focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">You Pay (PKR)</span>
              <span>Min: Rs. {minPkr.toLocaleString()} | Max: Rs. {maxPkr.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                value={pkrAmount}
                onChange={(e) => handlePkrChange(e.target.value)}
                placeholder="Enter PKR Amount"
                className="bg-transparent text-2xl sm:text-3xl font-bold text-white focus:outline-none w-full placeholder-slate-600"
              />
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-sm text-slate-200 shrink-0">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs">
                  ₨
                </div>
                PKR
              </div>
            </div>
          </div>

          {/* Quick PKR Selectors */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-500 self-center mr-1">Quick select:</span>
            {[5000, 10000, 25000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                onClick={() => handleQuickAmount(amt)}
                className="text-xs bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/60 transition-all font-medium"
              >
                ₨ {amt.toLocaleString()}
              </button>
            ))}
          </div>

          {/* You Receive (USDT) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 transition-all focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">You Receive (USDT TRC-20)</span>
              <span className="text-emerald-400 font-medium">0% Fee</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <input
                type="number"
                value={usdtAmount}
                onChange={(e) => handleUsdtChange(e.target.value)}
                placeholder="0.00"
                className="bg-transparent text-2xl sm:text-3xl font-bold text-emerald-400 focus:outline-none w-full placeholder-slate-600"
              />
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl font-bold text-sm text-slate-200 shrink-0">
                <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs">
                  ₮
                </div>
                USDT
              </div>
            </div>
          </div>
        </div>

        {/* Validation Warning */}
        {numPkr > 0 && !isValidAmount && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Order amount must be between <strong>Rs. {minPkr.toLocaleString()}</strong> and <strong>Rs. {maxPkr.toLocaleString()}</strong>.
            </span>
          </div>
        )}

        {/* Notice text */}
        {notice && (
          <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-slate-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleProceed}
          disabled={!isValidAmount || loading}
          className={`w-full mt-6 py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
            isValidAmount && !loading
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25 active:scale-[0.99]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Buy USDT Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">Local Payment Methods</h4>
            <p className="text-slate-400 text-xs mt-1">Pay instantly using JazzCash, Easypaisa, or direct Bank Transfer.</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">TRC-20 Fast Transfer</h4>
            <p className="text-slate-400 text-xs mt-1">Receive USDT directly into your TRON TRC-20 wallet address.</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">Fast Verification</h4>
            <p className="text-slate-400 text-xs mt-1">Admin verifies payment screenshots & releases crypto within 5-15 mins.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
