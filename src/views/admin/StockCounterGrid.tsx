'use client';

import React, { useState } from 'react';
import { PackageCheck, ShieldAlert, Plus, RefreshCw, Clock } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export interface StockSummaryItem {
  id: string;
  flavourId: string;
  flavourName: string;
  slug: string;
  primaryColor: string;
  size: 'G500' | 'G1000';
  sizeLabel: string;
  price: number;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  activeReservations: {
    id: string;
    orderId: string;
    orderNumber: string;
    quantity: number;
    expiresAt: string;
    remainingSeconds: number;
  }[];
}

interface StockCounterGridProps {
  items: StockSummaryItem[];
  onRefresh: () => void;
  onRestock: (inventoryItemId: string, amount: number) => Promise<void>;
}

export const StockCounterGrid: React.FC<StockCounterGridProps> = ({
  items,
  onRefresh,
  onRestock,
}) => {
  const [restockingId, setRestockingId] = useState<string | null>(null);

  const handleQuickRestock = async (id: string, amount: number) => {
    setRestockingId(id);
    try {
      await onRestock(id, amount);
    } finally {
      setRestockingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gold-100">
            Real-Time Vault Inventory Counters
          </h2>
          <p className="text-xs text-zinc-400">
            Atomic stock balance with active 10-minute reservation holds
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-obsidian-900 border border-gold-500/30 text-gold-300 text-xs font-semibold hover:bg-gold-500/10 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Grid of SKU Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const isCritical = item.availableStock <= 5;

          return (
            <div
              key={item.id}
              className={`relative rounded-2xl p-5 bg-obsidian-900/90 border transition-all duration-300 backdrop-blur-md ${
                isCritical
                  ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'border-zinc-800 hover:border-gold-500/40'
              }`}
            >
              {/* Top row: Flavour name, size badge & color tag */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-gold-500/50 shrink-0"
                    style={{ backgroundColor: item.primaryColor }}
                  />
                  <div>
                    <h3 className="font-serif text-base font-bold text-gold-100 line-clamp-1">
                      {item.flavourName}
                    </h3>
                    <span className="text-[11px] font-semibold text-gold-400">
                      {item.sizeLabel} • {formatINR(item.price)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shrink-0 ${
                    item.size === 'G500'
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                  }`}
                >
                  {item.size === 'G500' ? '500g' : '1000g'}
                </span>
              </div>

              {/* Three-column stock metrics */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-xl bg-obsidian-950 border border-zinc-850 text-center">
                {/* Available */}
                <div>
                  <span className="text-[10px] font-medium text-zinc-500 block uppercase tracking-wider">
                    Available
                  </span>
                  <span
                    className={`font-serif text-xl font-bold ${
                      isCritical ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {item.availableStock}
                  </span>
                </div>

                {/* Held / Reserved */}
                <div className="border-x border-zinc-800">
                  <span className="text-[10px] font-medium text-zinc-500 block uppercase tracking-wider">
                    Reserved
                  </span>
                  <span className="font-serif text-xl font-bold text-gold-400">
                    {item.reservedStock}
                  </span>
                </div>

                {/* Total Physical */}
                <div>
                  <span className="text-[10px] font-medium text-zinc-500 block uppercase tracking-wider">
                    Total
                  </span>
                  <span className="font-serif text-xl font-bold text-zinc-300">
                    {item.totalStock}
                  </span>
                </div>
              </div>

              {/* Active 10-min Holds indicator */}
              {item.activeReservations.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gold-400/90 font-medium">
                  <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span>
                    {item.activeReservations.length} active hold(s) locked
                  </span>
                </div>
              )}

              {/* Restock action */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Emergency Restock:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={restockingId === item.id}
                    onClick={() => handleQuickRestock(item.id, 10)}
                    className="px-2.5 py-1 rounded-lg bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-[11px] font-semibold transition-all disabled:opacity-50"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    disabled={restockingId === item.id}
                    onClick={() => handleQuickRestock(item.id, 25)}
                    className="px-2.5 py-1 rounded-lg bg-gold-gradient text-obsidian-950 text-[11px] font-bold hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    +25
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
