'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2, Sparkles, MapPin, Truck, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger luxury gold confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFF', '#9B741E'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const utrNumber = order.utrNumber || `UPI-UTR-${Date.now().toString().slice(-8)}`;
  const merchantUpiId = order.merchantUpiId || 'hemanth.icecreams@okhdfcbank';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-gold-lg text-zinc-100 text-center space-y-5">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-gold-200 hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-gold-gradient-soft border border-gold-500/50 flex items-center justify-center shadow-gold-md">
          <CheckCircle2 className="w-8 h-8 text-gold-400" />
        </div>

        {/* Order Confirmed Header */}
        <div className="space-y-1">
          <span className="text-xs font-semibold text-gold-400 tracking-widest uppercase">
            Demo UPI Verified • Stock Permanently Committed
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
            Order Confirmed
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Reference: <span className="text-gold-300 font-bold">{order.orderNumber}</span>
          </p>
        </div>

        {/* Demo UPI Receipt Details Card */}
        <div className="p-4 rounded-2xl bg-obsidian-950 border border-gold-500/25 space-y-2 text-left text-xs">
          <div className="flex items-center justify-between text-gold-400 font-semibold uppercase tracking-wider text-[10px]">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-gold-400" />
              <span>Demo UPI Settlement</span>
            </div>
            <span className="text-emerald-400">AUTH COMPLETE</span>
          </div>

          <div className="space-y-1 pt-1 text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-500">Merchant UPI ID:</span>
              <span className="font-mono text-gold-200 font-medium">{merchantUpiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">UTR / Ref Number:</span>
              <span className="font-mono text-gold-300 font-bold">{utrNumber}</span>
            </div>
          </div>
        </div>

        {/* Status Pipeline Tracker */}
        <div className="p-4 rounded-2xl bg-obsidian-950 border border-zinc-800 space-y-3 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gold-400 font-semibold uppercase tracking-wider">
              Preparation Pipeline
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold">
              SENT TO KITCHEN
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-3 text-xs text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Cryogenic thermal packaging in progress</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <Truck className="w-4 h-4 text-gold-400 shrink-0" />
              <span>Sub-zero concierge courier dispatched upon seal</span>
            </div>
          </div>
        </div>

        {/* Total & Destination Summary */}
        <div className="p-4 rounded-xl bg-obsidian-950/60 border border-zinc-850 flex items-center justify-between text-xs text-zinc-300">
          <div>
            <span className="text-zinc-500 block">Total Settled</span>
            <span className="font-serif text-lg font-bold text-gold-300">
              {formatINR(order.totalAmount)}
            </span>
          </div>
          <div className="text-right max-w-[200px]">
            <span className="text-zinc-500 block">Dispatch To</span>
            <span className="text-zinc-200 line-clamp-1">{order.customerName}</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-gradient text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-gold-sm hover:brightness-110 transition-all"
        >
          <span>Return To Haute Glacerie</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
