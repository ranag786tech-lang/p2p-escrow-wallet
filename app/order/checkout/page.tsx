'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ShieldCheck,
  Wallet,
  Phone,
  Mail,
  FileText,
  Loader2,
  CheckCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { Header, Footer } from '@/components/HeaderFooter';

interface PaymentMethod {
  id: string;
  name: string;
  accountTitle: string;
  accountNumber: string;
  instructions: string | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pkrParam = searchParams.get('pkr') || '10000';
  const usdtParam = searchParams.get('usdt') || '35.39';
  const rateParam = searchParams.get('rate') || '282.50';

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form Fields
  const [usdtWallet, setUsdtWallet] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [trxRef, setTrxRef] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch('/api/exchange-rate');
        const data = await res.json();
        if (data.success && data.paymentMethods?.length > 0) {
          setPaymentMethods(data.paymentMethods);
          setSelectedMethodId(data.paymentMethods[0].id);
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!usdtWallet.trim()) {
      setErrorMessage('Please enter your TRC-20 USDT Wallet Address.');
      return;
    }

    if (!usdtWallet.trim().startsWith('T') || usdtWallet.trim().length < 30) {
      setErrorMessage('Invalid TRC-20 USDT Address. TRC-20 addresses start with "T".');
      return;
    }

    if (!selectedMethodId) {
      setErrorMessage('Please select a payment method.');
      return;
    }

    if (!receiptImage && !trxRef.trim()) {
      setErrorMessage('Please upload a payment screenshot or enter the Transaction TRX reference number.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pkrAmount: parseFloat(pkrParam),
          usdtAmount: parseFloat(usdtParam),
          paymentMethodId: selectedMethodId,
          userUsdtWallet: usdtWallet.trim(),
          userPhone: phone.trim(),
          userEmail: email.trim(),
          proofScreenshotUrl: receiptImage,
          proofTxRef: trxRef.trim(),
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to submit order. Please try again.');
      }

      router.push(`/order/track?id=${resData.order.orderNumber}&created=1`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong submitting your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <p className="text-sm">Loading payment methods & exchange rates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 mb-6 transition-colors gap-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Calculator</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Payment Instructions & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">1</span>
              <span>Payment Details</span>
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Transfer exact PKR amount to one of our verified official accounts below.
            </p>

            {/* Order Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center text-xs text-slate-400 pb-3 border-b border-slate-800">
                <span>Order Summary</span>
                <span className="text-emerald-400 font-medium">Rate: 1 USDT = {rateParam} PKR</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <div>
                  <div className="text-xs text-slate-400">Amount to Transfer</div>
                  <div className="text-2xl font-black text-white">Rs. {parseFloat(pkrParam).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">You Receive</div>
                  <div className="text-xl font-bold text-emerald-400">{usdtParam} USDT</div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-300 block">Select Payment Method:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedMethodId(pm.id)}
                    className={`p-3 rounded-xl border text-left transition-all text-xs font-semibold flex flex-col justify-between ${
                      selectedMethodId === pm.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-bold text-white mb-1">{pm.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Instant Transfer</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Method Details Card */}
            {selectedMethod && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{selectedMethod.name} Account</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Verified Receiver</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Account Title</span>
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-white text-sm">{selectedMethod.accountTitle}</span>
                      <button
                        onClick={() => copyToClipboard(selectedMethod.accountTitle, 'title')}
                        className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                      >
                        {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Account / Mobile Number</span>
                    <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-mono font-bold text-emerald-400 text-base">{selectedMethod.accountNumber}</span>
                      <button
                        onClick={() => copyToClipboard(selectedMethod.accountNumber, 'number')}
                        className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800"
                      >
                        {copiedField === 'number' ? (
                          <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3 h-3" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy className="w-3 h-3" /> Copy Number</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {selectedMethod.instructions && (
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                      💡 {selectedMethod.instructions}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Wallet & Receipt Submission */}
        <div className="lg:col-span-5">
          <form onSubmit={handleSubmitOrder} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black">2</span>
              <span>Submit Proof & Wallet</span>
            </h2>

            {/* TRC-20 Wallet Address Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>TRC-20 Wallet Address (TRON) *</span>
                <span className="text-[10px] text-emerald-400">Must start with 'T'</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={usdtWallet}
                  onChange={(e) => setUsdtWallet(e.target.value)}
                  placeholder="e.g. T9x2Y7Z1aB3cD4eF5gH6iJ7kL8mN9oP0qR"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp / Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* TRX Reference Number */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Transaction ID / TRX Reference
              </label>
              <input
                type="text"
                value={trxRef}
                onChange={(e) => setTrxRef(e.target.value)}
                placeholder="e.g. TRX123456789"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>

            {/* File Upload / Screenshot */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Upload Payment Screenshot / Receipt
              </label>

              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 text-center bg-slate-950 transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {receiptImage ? (
                  <div className="space-y-2">
                    <img
                      src={receiptImage}
                      alt="Payment Receipt Preview"
                      className="max-h-36 mx-auto rounded-lg border border-slate-700 object-contain"
                    />
                    <span className="text-[11px] text-emerald-400 font-medium block">
                      Receipt uploaded! Click or drop to replace.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1 py-2">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-xs text-slate-300 font-medium">Click to upload receipt photo</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG or WEBP (Max 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Order CTA */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                submitting
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Confirm & Submit Order</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading Checkout...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
