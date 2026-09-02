'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Clock,
  QrCode,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Sparkles,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { formatINR, calculateCartTotals } from '@/lib/utils';
import { CartItemDTO, QRContextDTO } from '@/models/schemas';
import { GeoCoordinates } from '@/lib/geo';
import { GPSAddressCard } from './GPSAddressCard';

const DEMO_UPI_ID = 'hemanth.icecreams@okhdfcbank';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemDTO[];
  qrContext?: QRContextDTO | null;
  currentUser: { name: string; phoneNumber: string } | null;
  onOrderSuccess: (order: any) => void;
  onClearCart: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  qrContext,
  currentUser,
  onOrderSuccess,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Lord Hemanth');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phoneNumber || '+919876543210');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Villa 14, Royal Palm Residences, Bengaluru, Karnataka 560001'
  );
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>({
    latitude: 12.9716,
    longitude: 77.5946,
    accuracy: 10,
  });

  const [step, setStep] = useState<'ADDRESS' | 'UPI_PAYMENT' | 'PROCESSING'>('ADDRESS');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI State
  const [payerUpiId, setPayerUpiId] = useState('hemanth.guest@oksbi');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'CRED'>('GPAY');

  // Sync user state if logged in
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phoneNumber);
      setPayerUpiId(`${currentUser.name.toLowerCase().replace(/\s+/g, '')}@okaxis`);
    }
  }, [currentUser]);

  // Generate demo UTR reference when order is created
  useEffect(() => {
    if (createdOrder) {
      const randomUtr = `UPI-UTR-${Date.now().toString().slice(-8)}`;
      setUtrNumber(randomUtr);
    }
  }, [createdOrder]);

  // 10-Minute Reservation Countdown Timer
  useEffect(() => {
    if (step !== 'UPI_PAYMENT' || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Inventory reservation expired. Stock released back to vault.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, remainingSeconds]);

  if (!isOpen) return null;

  const totals = calculateCartTotals(
    items.map((i) => ({ price: i.price, quantity: i.quantity }))
  );

  const handleCopyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(DEMO_UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // 1. Create order & lock inventory
  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deliveryType: qrContext?.table ? 'DINE_IN' : 'DELIVERY',
          qrContext: qrContext || undefined,
          latitude: coordinates?.latitude || null,
          longitude: coordinates?.longitude || null,
          deliveryAddress,
          items,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCreatedOrder(data.order);
        setRemainingSeconds(600); // 10 minutes hold
        setStep('UPI_PAYMENT');
      } else {
        setError(data.error || 'Failed to place order. Check stock availability.');
      }
    } catch (err: any) {
      setError(err.message || 'Network connection failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Demo UPI Payment (Commits stock permanently)
  const handleVerifyUpiPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!createdOrder) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/verify-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.id,
          merchantUpiId: DEMO_UPI_ID,
          payerUpiId,
          utrNumber: utrNumber || `UPI-UTR-${Date.now().toString().slice(-8)}`,
          app: selectedUpiApp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onClearCart();
        onOrderSuccess({
          ...createdOrder,
          paymentMethod: 'DEMO_UPI',
          merchantUpiId: DEMO_UPI_ID,
          payerUpiId,
          utrNumber: data.utrNumber,
        });
        onClose();
      } else {
        setError(data.error || 'UPI verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Payment verification error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Simulate Failure (Rollback stock)
  const handleSimulateFailure = async () => {
    if (!createdOrder) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'payment.failed',
          orderId: createdOrder.id,
          gatewayPaymentId: `upi_failed_${Date.now()}`,
          utrNumber,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setError('UPI transaction rejected. 10-minute inventory lock released.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to trigger cancellation');
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const dynamicUpiUri = createdOrder
    ? `upi://pay?pa=${encodeURIComponent(DEMO_UPI_ID)}&pn=${encodeURIComponent(
        'Hemanth Ice Creams'
      )}&am=${createdOrder.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
        `Order ${createdOrder.orderNumber}`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-gold-lg text-zinc-100 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-gold-200 hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 tracking-widest uppercase">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Vault Checkout</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-gold-100">
            {step === 'ADDRESS' ? 'Concierge Delivery & Dispatch' : 'Demo UPI Payment & Verification'}
          </h3>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {step === 'ADDRESS' ? (
          <form onSubmit={handleInitiateOrder} className="space-y-5">
            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                  Guest Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 text-sm outline-none text-zinc-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                  Contact Mobile
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 text-sm outline-none text-zinc-100"
                />
              </div>
            </div>

            {/* GPS Geolocation Address Card */}
            <GPSAddressCard
              address={deliveryAddress}
              onAddressChange={setDeliveryAddress}
              coordinates={coordinates}
              onCoordinatesChange={setCoordinates}
            />

            {/* Order Summary Line */}
            <div className="p-4 rounded-xl bg-obsidian-950 border border-zinc-800 flex items-center justify-between text-xs">
              <div className="text-zinc-400">
                <span className="font-semibold text-zinc-200">
                  {items.reduce((a, b) => a + b.quantity, 0)} Tubs
                </span>{' '}
                • Incl. GST & Thermal Shipping
              </div>
              <div className="font-serif text-lg font-bold text-gold-300">
                {formatINR(totals.totalAmount)}
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gold-gradient text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-gold-md hover:brightness-110 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Lock Stock & Proceed to Demo UPI</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* 10-Minute Pessimistic Stock Hold Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-gold-950/40 via-obsidian-950 to-gold-950/40 border border-gold-500/40 text-center space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 text-gold-300 text-xs font-semibold tracking-wider uppercase">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                <span>Pessimistic Inventory Lock Active</span>
              </div>
              <div className="font-serif text-3xl font-bold tracking-tight text-gold-300 font-mono">
                {formattedTime}
              </div>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                Stock is reserved for Order <span className="text-gold-200 font-mono font-semibold">{createdOrder?.orderNumber}</span>. Total due:{' '}
                <strong className="text-gold-300 font-serif">{formatINR(createdOrder?.totalAmount || 0)}</strong>.
              </p>
            </div>

            {/* Demo UPI ID Card */}
            <div className="p-5 rounded-2xl bg-obsidian-950 border border-gold-500/30 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gold-400" />
                  <span className="text-xs font-semibold text-gold-300 uppercase tracking-wider">
                    Official Demo UPI ID
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 uppercase">
                  Zero-Gateway Sandbox
                </span>
              </div>

              {/* Copyable UPI Box */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-obsidian-900 border border-gold-500/40">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">
                    Merchant VPA / UPI ID
                  </span>
                  <span className="font-mono text-sm sm:text-base font-bold text-gold-200 select-all">
                    {DEMO_UPI_ID}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/40 text-gold-300 text-xs font-semibold transition-all"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Supported UPI Apps */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[10px] text-zinc-400">Select Demo UPI Provider:</span>
                <div className="flex gap-2">
                  {(['GPAY', 'PHONEPE', 'PAYTM', 'CRED'] as const).map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider transition-all ${
                        selectedUpiApp === app
                          ? 'bg-gold-500 text-obsidian-950 shadow-gold-sm'
                          : 'bg-obsidian-900 text-zinc-400 border border-zinc-800 hover:border-gold-500/30'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payer VPA & UTR Form */}
            <form onSubmit={handleVerifyUpiPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider block">
                    Your UPI VPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={payerUpiId}
                    onChange={(e) => setPayerUpiId(e.target.value)}
                    placeholder="guest@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 text-xs font-mono outline-none text-zinc-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gold-400 uppercase tracking-wider block">
                    12-Digit UTR / Transaction Ref
                  </label>
                  <input
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="UPI-UTR-98471203"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 text-xs font-mono outline-none text-gold-300 font-semibold"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-2">
                {/* 1-Click Fast Approve */}
                <button
                  type="submit"
                  disabled={loading || remainingSeconds <= 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-gradient text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-md hover:brightness-110 active:scale-95 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Authorize Demo UPI Payment</span>
                    </>
                  )}
                </button>

                {/* Simulate Failure */}
                <button
                  type="button"
                  disabled={loading || remainingSeconds <= 0}
                  onClick={handleSimulateFailure}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-950/30 hover:bg-red-950/50 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simulate UPI Payment Rejection (Rollback Stock)</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
