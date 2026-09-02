'use client';

import React, { useState } from 'react';
import { Clock, ShieldAlert, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { StockSummaryItem } from './StockCounterGrid';

interface ReservationMonitorProps {
  items: StockSummaryItem[];
  onReleaseHold: (orderId: string) => Promise<void>;
  onTriggerCleanup: () => Promise<void>;
}

export const ReservationMonitor: React.FC<ReservationMonitorProps> = ({
  items,
  onReleaseHold,
  onTriggerCleanup,
}) => {
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [cleaning, setCleaning] = useState(false);

  // Aggregate all active holds
  const allReservations = items.flatMap((item) =>
    item.activeReservations.map((r) => ({
      ...r,
      flavourName: item.flavourName,
      sizeLabel: item.sizeLabel,
      inventoryItemId: item.id,
    }))
  );

  const handleRelease = async (orderId: string) => {
    setReleasingId(orderId);
    try {
      await onReleaseHold(orderId);
    } finally {
      setReleasingId(null);
    }
  };

  const handleCleanup = async () => {
    setCleaning(true);
    try {
      await onTriggerCleanup();
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-gold-500/20 backdrop-blur-xl shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 tracking-wider uppercase">
            <Clock className="w-4 h-4 text-gold-400" />
            <span>Pessimistic 10-Minute Hold Monitor</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-gold-100 mt-1">
            Active Inventory Locks ({allReservations.length})
          </h3>
        </div>

        <button
          type="button"
          disabled={cleaning}
          onClick={handleCleanup}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${cleaning ? 'animate-spin' : ''}`} />
          <span>Scan & Clear Expired Holds</span>
        </button>
      </div>

      {/* Table of active locks */}
      {allReservations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-obsidian-950 border border-zinc-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
          <p className="font-serif text-sm text-zinc-300">No Pending Holds</p>
          <p className="text-xs text-zinc-500">
            All inventory is fully committed or available for order.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-obsidian-950 text-gold-400/90 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Order Reference</th>
                <th className="p-3.5">Flavour & Packaging</th>
                <th className="p-3.5 text-center">Qty Held</th>
                <th className="p-3.5 text-center">Remaining TTL</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-obsidian-900/60">
              {allReservations.map((res) => {
                const mins = Math.floor(res.remainingSeconds / 60);
                const secs = res.remainingSeconds % 60;
                const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

                return (
                  <tr key={res.id} className="hover:bg-obsidian-800/40 transition-colors">
                    <td className="p-3.5 font-mono text-gold-200 font-semibold">
                      {res.orderNumber}
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-zinc-100">{res.flavourName}</span>
                      <span className="text-zinc-500 block text-[11px]">{res.sizeLabel}</span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-gold-400">
                      {res.quantity}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {timeString}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        disabled={releasingId === res.orderId}
                        onClick={() => handleRelease(res.orderId)}
                        className="px-3 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-500/30 text-[11px] font-semibold transition-all disabled:opacity-50"
                      >
                        Release Lock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
