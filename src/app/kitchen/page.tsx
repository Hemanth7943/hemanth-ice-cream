'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Truck,
  ChefHat,
  RefreshCw,
  LogOut,
  PackageCheck,
  Clock,
  MapPin,
  QrCode,
  Phone,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';
import KitchenLoginPage from '../login/kitchen/page';

export default function DedicatedKitchenPage() {
  const { user, isAuthenticated, role, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [stationSummary, setStationSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch kitchen live queue
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/kitchen/queue');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setOrders(json.orders);
      }
    } catch (e) {
      console.warn('Failed to fetch kitchen queue:', e);
    }
  }, []);

  // Fetch batch SKU summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch('/api/kitchen/station-summary');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStationSummary(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch station summary:', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchQueue(), fetchSummary()]);
    setLoading(false);
  }, [fetchQueue, fetchSummary]);

  useEffect(() => {
    if (isAuthenticated && (role === 'KITCHEN' || role === 'ADMIN')) {
      refreshAll();
    }
  }, [isAuthenticated, role, refreshAll]);

  // Periodic polling every 5s
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || (role !== 'KITCHEN' && role !== 'ADMIN')) return;
    const interval = setInterval(() => {
      refreshAll();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, role, refreshAll]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/kitchen/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await refreshAll();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-blue-400">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, render kitchen login
  if (!isAuthenticated) {
    return <KitchenLoginPage />;
  }

  // If customer is trying to access kitchen, block access
  if (role === 'CUSTOMER') {
    return (
      <main className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 text-zinc-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-obsidian-900 border border-blue-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">
              Kitchen Station Restricted Area
            </h2>
            <p className="text-xs text-zinc-400">
              You are logged in as a <strong>Customer</strong>. Customers do not have clearance to view internal kitchen tickets or thermal preparation stations.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-gradient text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110 transition-all"
            >
              <span>Return to Customer Storefront</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-zinc-100 selection:bg-blue-500 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-obsidian-900/90 backdrop-blur-xl border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-zinc-100">
                  Haute Glacerie Cryo-Kitchen
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase">
                  Station Terminal
                </span>
              </div>
              <p className="text-xs text-zinc-400">Sub-Zero Packaging & Live Ticket Dispatch</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                autoRefresh
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              {autoRefresh ? '● Stream Active' : '○ Paused'}
            </button>

            <button
              type="button"
              onClick={refreshAll}
              className="p-2 rounded-lg bg-obsidian-950 border border-zinc-800 text-blue-400 hover:bg-blue-500/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg bg-obsidian-950 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Batch Churning Summary Bar */}
        {stationSummary.length > 0 && (
          <div className="p-5 rounded-3xl bg-obsidian-900/90 border border-blue-500/30 backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
              <ChefHat className="w-4 h-4" />
              <span>Cryo-Station Live Batch Requirements (Pending Packaging)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stationSummary.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-obsidian-950 border border-zinc-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-serif font-bold text-xs text-zinc-100 block line-clamp-1">
                      {b.flavourName}
                    </span>
                    <span className="text-[10px] text-zinc-500">{b.size}</span>
                  </div>
                  <span className="text-lg font-bold font-serif text-blue-400">{b.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Orders Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">
              Live Preparation Tickets ({orders.length})
            </h2>
            <span className="text-xs text-zinc-400">Auto-synced with Customer Demo UPI Payments</span>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-obsidian-900 border border-zinc-800 text-center space-y-2">
              <ChefHat className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="font-serif text-base text-zinc-300">No Tickets Awaiting Kitchen Prep</p>
              <p className="text-xs text-zinc-500">
                Paid orders from VIP customers will immediately stream here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {orders.map((order) => {
                let parsedQR = null;
                try {
                  if (order.qrContext) parsedQR = JSON.parse(order.qrContext);
                } catch (e) {}

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl p-6 bg-obsidian-900/90 border border-zinc-800 hover:border-blue-500/40 transition-all duration-300 shadow-xl space-y-5 backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-xs text-blue-400 font-bold tracking-wider">
                          {order.orderNumber}
                        </span>
                        <h4 className="font-serif text-base font-semibold text-zinc-100 mt-0.5">
                          {order.customerName}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                          <Phone className="w-3 h-3 text-blue-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                          order.status === 'PAID_CONFIRMED'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                            : order.status === 'PREPARING'
                            ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                            : order.status === 'OUT_FOR_DELIVERY'
                            ? 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                        }`}
                      >
                        {order.status === 'PAID_CONFIRMED'
                          ? 'PAID • READY'
                          : order.status === 'PREPARING'
                          ? 'IN CRYO-PREP'
                          : order.status === 'OUT_FOR_DELIVERY'
                          ? 'DISPATCHED'
                          : order.status}
                      </span>
                    </div>

                    {parsedQR && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-xs text-blue-300">
                        <QrCode className="w-3.5 h-3.5 text-blue-400" />
                        <span>
                          {parsedQR.zone || parsedQR.stand || 'Lounge'}{' '}
                          {parsedQR.table ? `• Table ${parsedQR.table}` : ''}
                        </span>
                      </div>
                    )}

                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2 text-xs text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.deliveryAddress}</span>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-obsidian-950 border border-zinc-850 space-y-2.5">
                      <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block">
                        Tubs to Pack ({order.orderItems.length})
                      </span>
                      <div className="space-y-2">
                        {order.orderItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs text-zinc-200"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-300 font-bold text-[11px] flex items-center justify-center">
                                {item.quantity}x
                              </span>
                              <span className="font-medium">{item.flavourName}</span>
                              <span className="text-zinc-500 text-[11px]">({item.size})</span>
                            </div>
                            <span className="font-serif font-semibold text-zinc-300">
                              {formatINR(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 flex gap-3">
                      {order.status === 'PAID_CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>Start Cryo-Prep</span>
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                        >
                          <Truck className="w-4 h-4" />
                          <span>Dispatch Courier</span>
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
