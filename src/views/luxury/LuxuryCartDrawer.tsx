'use client';

import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ShieldCheck, ArrowRight, Sparkles, Clock } from 'lucide-react';
import { formatINR, calculateCartTotals } from '@/lib/utils';
import { CartItemDTO } from '@/models/schemas';

interface LuxuryCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItemDTO[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const LuxuryCartDrawer: React.FC<LuxuryCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totals = calculateCartTotals(
    items.map((i) => ({ price: i.price, quantity: i.quantity }))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-obsidian-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-obsidian-900 border-l border-gold-500/25 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-gold-500/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gold-100 uppercase tracking-wider">
                  Your Vault
                </h3>
                <p className="text-xs text-zinc-400">
                  {items.length} {items.length === 1 ? 'Creation' : 'Creations'} Selected
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-gold-200 hover:bg-obsidian-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-zinc-800/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                <ShoppingBag className="w-12 h-12 text-zinc-700 stroke-1" />
                <p className="font-serif text-base text-zinc-300">Your Vault is Empty</p>
                <p className="text-xs text-zinc-500 max-w-[220px]">
                  Explore our six signature Grand Cru tubs and reserve your batch.
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={`${item.inventoryItemId}-${index}`} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-gold-100">
                        {item.flavourName}
                      </h4>
                      <p className="text-xs text-gold-400/90 font-medium">
                        {item.size === 'G500' ? '500g Tub' : '1000g Family Tub'} • {formatINR(item.price)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-obsidian-950 border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="p-1 text-zinc-400 hover:text-gold-300 disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-zinc-200 px-2 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="p-1 text-zinc-400 hover:text-gold-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <span className="font-serif text-sm font-bold text-gold-200">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gold-500/20 bg-obsidian-950/90 space-y-4">
              {/* 10-Minute Hold Policy Alert */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gold-500/10 border border-gold-500/25 text-[11px] text-gold-300">
                <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>
                  Placing an order triggers a <strong>10-minute atomic inventory lock</strong> in our fresh vault.
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-200 font-medium">{formatINR(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confectionery GST (5%)</span>
                  <span className="text-zinc-200 font-medium">{formatINR(totals.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thermal Freeze Delivery</span>
                  <span className="text-zinc-200 font-medium">
                    {totals.deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">COMPLIMENTARY</span>
                    ) : (
                      formatINR(totals.deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold text-gold-100">
                  <span className="font-serif">Total Due</span>
                  <span className="font-serif text-base text-gold-300">
                    {formatINR(totals.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gold-gradient text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-gold-md hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Proceed To Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
