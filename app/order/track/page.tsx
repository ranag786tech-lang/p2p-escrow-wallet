'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Receipt,
  Sparkles
} from 'lucide-react';
import { Header, Footer } from '@/components/HeaderFooter';

interface OrderDetails {
  id: string;
  orderNumber: string;
  pkrAmount: number;
  usdtAmount: number;
  exchangeRate: number;
  paymentMethodName: string;
  userUsdtWallet: string;
  userPhone: string | null;
  userEmail: string | null;
  proofScreenshotUrl: string | null;
  proofTxRef: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('id') || '';
  const isJustCreated = searchParams.get('created') === '1';

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copiedWallet, setCopiedWallet] = useState<boolean>(false);

  const fetchOrder = async (queryId: string) => {
    if (!queryId.trim()) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/orders/${encodeURIComponent(queryId.trim())}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMsg(data.error || 'Order not found. Please check your order number or ID.');
      }
    } catch (err) {
      setOrder(null);
      setErrorMsg('Failed to fetch order status. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchOrder(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchQuery);
  };

  const copyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedWallet(true);
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> Approved & Dispatched
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs">
            <XCircle className="w-4 h-4" /> Order Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
            <Clock className="w-4 h-4 animate-spin text-amber-400" /> Pending Admin Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Success banner if redirected right after order creation */}
      {isJustCreated && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold block text-emerald-200">Order Submitted Successfully!</span>
              <span>Your transaction is now pending verification. Admin usually processes in 5-15 minutes.</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h1 className="text-xl font-bold text-white mb-2">Track Order Status</h1>
        <p className="text-xs text-slate-400 mb-4">
          Enter your Order Number (e.g. ORD-123456) or Order ID to inspect payment & delivery status.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. ORD-894120"
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Order Details Card */}
      {order && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-medium">Order Reference</div>
              <div className="text-2xl font-black text-white font-mono tracking-wide">{order.orderNumber}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Submitted on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
            <div>{renderStatusBadge(order.status)}</div>
          </div>

          {/* Amount Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Paid Amount</div>
              <div className="text-base font-bold text-white">Rs. {order.pkrAmount.toLocaleString()}</div>
              <div className="text-[10px] text-slate-500">{order.paymentMethodName}</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">USDT to Receive</div>
              <div className="text-base font-bold text-emerald-400">{order.usdtAmount} USDT</div>
              <div className="text-[10px] text-slate-500">TRC-20 Network</div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400">Exchange Rate</div>
              <div className="text-sm font-semibold text-slate-300">1 USDT = {order.exchangeRate} PKR</div>
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <div className="text-xs text-slate-400 mb-1">TRC-20 Wallet Address</div>
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="font-mono text-xs text-slate-200 truncate pr-2">{order.userUsdtWallet}</span>
              <button
                onClick={() => copyWallet(order.userUsdtWallet)}
                className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 shrink-0"
              >
                {copiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Transaction Reference & Screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {order.proofTxRef && (
              <div>
                <div className="text-xs text-slate-400 mb-1">Transaction Ref / TRX ID</div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
                  {order.proofTxRef}
                </div>
              </div>
            )}

            {order.proofScreenshotUrl && (
              <div>
                <div className="text-xs text-slate-400 mb-1">Submitted Receipt Proof</div>
                <a
                  href={order.proofScreenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline bg-slate-950 p-3 rounded-xl border border-slate-800 w-full"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>View Uploaded Receipt</span>
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </a>
              </div>
            )}
          </div>

          {/* Admin Note if any */}
          {order.adminNote && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <div className="text-xs font-semibold text-slate-300 mb-1">Admin Remark</div>
              <p className="text-xs text-slate-400 leading-relaxed">{order.adminNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading Order Tracking...</div>}>
          <TrackContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
