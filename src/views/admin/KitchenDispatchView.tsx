'use client';

import React from 'react';
import { ChefHat, Truck, CheckCircle2, Clock, MapPin, QrCode, Phone, Sparkles } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: string;
  qrContext: string | null;
  deliveryAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  orderItems: {
    id: string;
    flavourName: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
}

interface KitchenDispatchViewProps {
  orders: KitchenOrder[];
  onUpdateStatus: (orderId: string, nextStatus: string) => Promise<void>;
}

export const KitchenDispatchView: React.FC<KitchenDispatchViewProps> = ({
  orders,
  onUpdateStatus,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID_CONFIRMED':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
          label: 'PAID • READY FOR PREP',
        };
      case 'PREPARING':
        return {
          bg: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
          label: 'IN CRYO-PREPARATION',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          bg: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
          label: 'OUT FOR COURIER DISPATCH',
        };
      case 'DELIVERED':
        return {
          bg: 'bg-zinc-800 border-zinc-700 text-zinc-400',
          label: 'DELIVERED',
        };
      case 'PENDING_PAYMENT':
        return {
          bg: 'bg-gold-500/15 border-gold-500/30 text-gold-300',
          label: 'AWAITING PAYMENT (HELD)',
        };
      default:
        return {
          bg: 'bg-red-950/40 border-red-500/30 text-red-300',
          label: status,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-gold-100">
          Kitchen Live Dispatch & Cryo-Station
        </h2>
        <p className="text-xs text-zinc-400">
          Real-time order tickets with thermal packaging status workflow
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 rounded-3xl bg-obsidian-900 border border-zinc-800 text-center space-y-2">
          <ChefHat className="w-10 h-10 mx-auto text-zinc-600" />
          <p className="font-serif text-base text-zinc-300">No Orders in Dispatch Queue</p>
          <p className="text-xs text-zinc-500">
            Incoming orders from storefront and QR tables will stream here live.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            let parsedQR = null;
            try {
              if (order.qrContext) parsedQR = JSON.parse(order.qrContext);
            } catch (e) {}

            return (
              <div
                key={order.id}
                className="rounded-3xl p-6 bg-obsidian-900/90 border border-zinc-800 hover:border-gold-500/30 transition-all duration-300 shadow-xl space-y-5 backdrop-blur-md"
              >
                {/* Header: Order Number & Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs text-gold-400 font-bold tracking-wider">
                      {order.orderNumber}
                    </span>
                    <h4 className="font-serif text-base font-semibold text-zinc-100 mt-0.5">
                      {order.customerName}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                      <Phone className="w-3 h-3 text-gold-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* QR Table / Zone Context if present */}
                {parsedQR && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gold-500/10 border border-gold-500/25 text-xs text-gold-300">
                    <QrCode className="w-3.5 h-3.5 text-gold-400" />
                    <span>
                      {parsedQR.zone || parsedQR.stand || 'Lounge'}{' '}
                      {parsedQR.table ? `• Table ${parsedQR.table}` : ''}
                    </span>
                  </div>
                )}

                {/* Delivery Address & GPS */}
                {order.deliveryAddress && (
                  <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{order.deliveryAddress}</span>
                  </div>
                )}

                {/* Line Items List */}
                <div className="p-4 rounded-2xl bg-obsidian-950 border border-zinc-850 space-y-2.5">
                  <span className="text-[10px] font-semibold text-gold-400/90 uppercase tracking-widest block">
                    Cryo-Packaging Items ({order.orderItems.length})
                  </span>

                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-zinc-200"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-gold-500/20 text-gold-300 font-bold text-[11px] flex items-center justify-center">
                            {item.quantity}x
                          </span>
                          <span className="font-medium">{item.flavourName}</span>
                          <span className="text-zinc-500 text-[11px]">({item.size})</span>
                        </div>
                        <span className="font-serif font-semibold text-gold-300">
                          {formatINR(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs font-bold text-zinc-100">
                    <span>Total Ticket</span>
                    <span className="font-serif text-sm text-gold-300">
                      {formatINR(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 flex gap-3">
                  {order.status === 'PAID_CONFIRMED' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-obsidian-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-gold-sm"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Start Cryo-Prep</span>
                    </button>
                  )}

                  {order.status === 'PREPARING' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Dispatch Sub-Zero Courier</span>
                    </button>
                  )}

                  {order.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Delivered</span>
                    </button>
                  )}

                  {order.status === 'DELIVERED' && (
                    <div className="w-full py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 text-center text-xs font-semibold text-emerald-400">
                      ✓ Completed & Delivered
                    </div>
                  )}

                  {order.status === 'PENDING_PAYMENT' && (
                    <div className="w-full py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 text-center text-xs font-semibold text-gold-400">
                      Awaiting Customer Payment Lock
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
