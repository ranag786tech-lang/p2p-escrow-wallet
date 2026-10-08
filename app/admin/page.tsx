'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Key,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  Edit3,
  Save,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  Settings,
  ArrowLeft,
  ExternalLink,
  Eye,
  X,
  AlertCircle
} from 'lucide-react';
import { Header, Footer } from '@/components/HeaderFooter';

interface Order {
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
}

interface SettingsData {
  minPkr: number;
  maxPkr: number;
  noticeText: string;
}

export default function AdminPage() {
  const [pinInput, setPinInput] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Admin Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentRate, setCurrentRate] = useState<number>(282.50);
  const [settings, setSettings] = useState<SettingsData>({ minPkr: 500, maxPkr: 1000000, noticeText: '' });
  const [loading, setLoading] = useState<boolean>(false);

  // Form State for Exchange Rate & Settings
  const [newRateInput, setNewRateInput] = useState<string>('');
  const [rateSuccessMsg, setRateSuccessMsg] = useState<string>('');
  const [updatingRate, setUpdatingRate] = useState<boolean>(false);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order for Receipt Inspector / Actions
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNote, setActionNote] = useState<string>('');
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<boolean>(false);

  const fetchAdminData = async (pin: string) => {
    try {
      setLoading(true);
      setAuthError('');
      const res = await fetch('/api/admin', {
        headers: { 'x-admin-pin': pin },
      });

      const data = await res.json();

      if (res.status === 401 || !data.success) {
        setAuthError(data.error || 'Invalid Admin PIN.');
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      setAdminPin(pin);
      setOrders(data.orders || []);
      setCurrentRate(data.rate || 282.50);
      setNewRateInput((data.rate || 282.50).toString());
      if (data.settings) {
        setSettings({
          minPkr: data.settings.minPkr,
          maxPkr: data.settings.maxPkr,
          noticeText: data.settings.noticeText || '',
        });
      }
    } catch (err: any) {
      setAuthError('Connection error. Please try again.');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    fetchAdminData(pinInput.trim());
  };

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRateInput || isNaN(Number(newRateInput))) return;

    try {
      setUpdatingRate(true);
      setRateSuccessMsg('');
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify({
          action: 'UPDATE_RATE',
          newRate: parseFloat(newRateInput),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentRate(data.rate);
        setRateSuccessMsg('Exchange rate updated successfully globally!');
        setTimeout(() => setRateSuccessMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to update exchange rate.');
      }
    } catch (err) {
      alert('Error updating rate.');
    } finally {
      setUpdatingRate(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setUpdatingOrderStatus(true);
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify({
          action: 'UPDATE_ORDER_STATUS',
          orderId,
          status,
          adminNote: actionNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local order list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status, adminNote: actionNote } : o))
        );
        setSelectedOrder(null);
        setActionNote('');
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setUpdatingOrderStatus(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userUsdtWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.proofTxRef && o.proofTxRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.userPhone && o.userPhone.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Authentication</h1>
              <p className="text-xs text-slate-400">Enter Admin Passcode / PIN to access management dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Admin PIN</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter PIN (Default: 123456)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'Authenticating...' : 'Access Dashboard'}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <span>Admin Management Dashboard</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live Session
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Control PKR/USDT exchange rates, inspect transaction receipts, and approve order settlements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAdminData(adminPin)}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>
        </div>

        {/* Global Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Rate Controller Box */}
          <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>Global Exchange Rate</span>
              </h2>
              <span className="text-xs text-slate-400 font-mono">1 USDT = {currentRate} PKR</span>
            </div>

            <form onSubmit={handleUpdateRate} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Set PKR Amount for 1 USDT</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newRateInput}
                    onChange={(e) => setNewRateInput(e.target.value)}
                    placeholder="e.g. 283.00"
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={updatingRate}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Rate</span>
                  </button>
                </div>
              </div>

              {rateSuccessMsg && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
                  {rateSuccessMsg}
                </div>
              )}
            </form>
          </div>

          {/* Quick Metrics */}
          <div className="md:col-span-6 grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Pending Verification</span>
              <span className="text-2xl font-black text-amber-400">
                {orders.filter((o) => o.status === 'PENDING').length}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Approved Orders</span>
              <span className="text-2xl font-black text-emerald-400">
                {orders.filter((o) => o.status === 'APPROVED').length}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Orders</span>
              <span className="text-2xl font-black text-white">{orders.length}</span>
            </div>
          </div>
        </div>

        {/* Order Management Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Customer Orders & Verification</span>
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ORD, TRC-20, TRX..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Order Ref / Date</th>
                  <th className="py-3.5 px-4">Paid (PKR)</th>
                  <th className="py-3.5 px-4">Receive (USDT)</th>
                  <th className="py-3.5 px-4">TRC-20 Wallet</th>
                  <th className="py-3.5 px-4">Receipt Proof</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-white block">{o.orderNumber}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString()}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-bold text-white">
                        Rs. {o.pkrAmount.toLocaleString()}
                        <span className="block text-[10px] font-normal text-slate-400">{o.paymentMethodName}</span>
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-400">
                        {o.usdtAmount} USDT
                        <span className="block text-[10px] font-normal text-slate-400">@ {o.exchangeRate} PKR</span>
                      </td>

                      <td className="py-4 px-4 font-mono text-[11px]">
                        <span className="text-slate-200 block truncate max-w-[140px]">{o.userUsdtWallet}</span>
                        {o.userPhone && <span className="text-[10px] text-slate-400 block">{o.userPhone}</span>}
                      </td>

                      <td className="py-4 px-4">
                        {o.proofScreenshotUrl ? (
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium hover:bg-emerald-500/20 transition-all text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Proof</span>
                          </button>
                        ) : o.proofTxRef ? (
                          <span className="font-mono text-[11px] text-amber-300">{o.proofTxRef}</span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">No Proof</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {o.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                            Approved
                          </span>
                        )}
                        {o.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[10px]">
                            Rejected
                          </span>
                        )}
                        {o.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px]">
                            Pending Review
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-all text-xs"
                        >
                          Inspect & Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Modal Inspector */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-950 rounded-full border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Order Verification Modal</div>
                <h3 className="text-2xl font-black text-white font-mono">{selectedOrder.orderNumber}</h3>
              </div>

              {/* Order Info Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">PKR Paid</span>
                  <span className="text-sm font-bold text-white">Rs. {selectedOrder.pkrAmount.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedOrder.paymentMethodName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block">USDT Payable</span>
                  <span className="text-sm font-bold text-emerald-400">{selectedOrder.usdtAmount} USDT</span>
                  <span className="text-[10px] text-slate-500 block">TRC-20 Network</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block">Customer Contact</span>
                  <span className="text-slate-200 font-semibold">{selectedOrder.userPhone || 'No Phone'}</span>
                  <span className="text-[10px] text-slate-500 block">{selectedOrder.userEmail || ''}</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">TRC-20 USDT Wallet Address</span>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 font-bold flex justify-between items-center">
                  <span className="select-all">{selectedOrder.userUsdtWallet}</span>
                </div>
              </div>

              {/* TRX Ref */}
              {selectedOrder.proofTxRef && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Transaction Ref TRX</span>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
                    {selectedOrder.proofTxRef}
                  </div>
                </div>
              )}

              {/* Receipt Image Preview */}
              {selectedOrder.proofScreenshotUrl && (
                <div>
                  <span className="text-xs text-slate-400 block mb-2">Attached Payment Screenshot</span>
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-2xl flex justify-center">
                    <img
                      src={selectedOrder.proofScreenshotUrl}
                      alt="Payment Receipt"
                      className="max-h-72 object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Remark Note */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Admin Remark / Transfer TXID</label>
                <input
                  type="text"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Sent USDT via Binance TXID: 9812739812"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'APPROVED')}
                  disabled={updatingOrderStatus}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Complete</span>
                </button>

                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'REJECTED')}
                  disabled={updatingOrderStatus}
                  className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Order</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
