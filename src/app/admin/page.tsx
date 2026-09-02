'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  ChefHat,
  PackageCheck,
  Clock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Lock,
  LogOut,
  Users,
  Activity,
  DollarSign,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { StockCounterGrid, StockSummaryItem } from '@/views/admin/StockCounterGrid';
import { ReservationMonitor } from '@/views/admin/ReservationMonitor';
import { formatINR } from '@/lib/utils';
import AdminLoginPage from '../login/admin/page';

export default function AdminChamberPage() {
  const { user, isAuthenticated, role, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'CUSTOMERS' | 'INVENTORY' | 'ANALYTICS'>('LOGS');
  const [stockItems, setStockItems] = useState<StockSummaryItem[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [logStats, setLogStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // 1. Fetch Login Audit Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/login-logs');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLoginLogs(json.data.logs);
          setLogStats(json.data.stats);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch login logs:', e);
    }
  }, []);

  // 2. Fetch Customers List & Spend
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/customers');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setCustomers(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch customers:', e);
    }
  }, []);

  // 3. Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setAnalytics(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch analytics:', e);
    }
  }, []);

  // 4. Fetch Stock & Holds
  const fetchStock = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStockItems(json.data);
      }
    } catch (e) {
      console.warn('Failed to fetch inventory:', e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchLogs(), fetchCustomers(), fetchAnalytics(), fetchStock()]);
    setLoading(false);
  }, [fetchLogs, fetchCustomers, fetchAnalytics, fetchStock]);

  useEffect(() => {
    if (isAuthenticated && role === 'ADMIN') {
      refreshAll();
    }
  }, [isAuthenticated, role, refreshAll]);

  // Periodic polling every 5 seconds
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || role !== 'ADMIN') return;
    const interval = setInterval(() => {
      refreshAll();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, role, refreshAll]);

  // Restock & Hold release actions
  const handleRestock = async (inventoryItemId: string, amount: number) => {
    await fetch('/api/inventory/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryItemId, amount }),
    });
    await fetchStock();
  };

  const handleReleaseHold = async (orderId: string) => {
    await fetch('/api/inventory/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, reason: 'ADMIN_MANUAL_RELEASE' }),
    });
    await refreshAll();
  };

  const handleTriggerCleanup = async () => {
    await fetch('/api/inventory/cleanup', { method: 'POST' });
    await refreshAll();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-amber-400">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, render admin login
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  // If customer is trying to access admin, block access
  if (role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-obsidian-950 flex items-center justify-center p-4 text-zinc-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-obsidian-900 border border-amber-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-zinc-100">
              Master Admin Clearance Required
            </h2>
            <p className="text-xs text-zinc-400">
              You are logged in as <strong>{user?.name}</strong> ({role}). Only the Master Admin (Chef Hemanth P) has clearance to view system login logs and audit trails.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110 transition-all"
            >
              <span>Return to Storefront</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-zinc-300 text-xs font-semibold uppercase transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-zinc-100 selection:bg-amber-500 selection:text-obsidian-950 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-obsidian-900/90 backdrop-blur-xl border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-obsidian-950 border border-zinc-800 text-zinc-400 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-gold-100">
                  Hemanth Haute Glacerie
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  Master Admin Chamber
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Logged in as: <strong className="text-gold-200">{user?.name}</strong> • Full Audit Authority
              </p>
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
              {autoRefresh ? '● Live Audit Active' : '○ Paused'}
            </button>

            <button
              type="button"
              onClick={refreshAll}
              className="p-2 rounded-lg bg-obsidian-950 border border-zinc-800 text-amber-400 hover:bg-amber-500/10 transition-colors"
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

        {/* View Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => setActiveTab('LOGS')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'LOGS'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>🔐 Login Activity & Audit Logs ({loginLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CUSTOMERS')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'CUSTOMERS'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>💎 Customer Directory ({customers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'INVENTORY'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>📦 Vault Stock & 10-Min Locks</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'ANALYTICS'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>📊 Revenue & Churn Metrics</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* TAB 1: LOGIN AUDIT LOGS */}
        {activeTab === 'LOGS' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-zinc-100">
                  User & Staff Login Audit Logs
                </h2>
                <p className="text-xs text-zinc-400">
                  Chronological record of all authentication events, IP addresses, methods, and roles
                </p>
              </div>

              {logStats && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-obsidian-900 border border-zinc-800 text-zinc-300">
                    Total: <strong className="text-amber-300">{logStats.totalLogins}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300">
                    Customers: <strong>{logStats.byRole?.customer || 0}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Admin: <strong>{logStats.byRole?.admin || 0}</strong>
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
                    Kitchen: <strong>{logStats.byRole?.kitchen || 0}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-obsidian-900/90 shadow-2xl backdrop-blur-md">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-obsidian-950 text-amber-400/90 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">User / Phone</th>
                    <th className="p-4">Role Access</th>
                    <th className="p-4">Login Method</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-obsidian-900/40">
                  {loginLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-obsidian-800/40 transition-colors">
                      <td className="p-4 font-mono text-zinc-400">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-zinc-100 block">
                          {log.name || log.user?.name || 'Guest User'}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-500">{log.phoneNumber}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            log.role === 'ADMIN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : log.role === 'KITCHEN'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-gold-500/10 text-gold-300 border border-gold-500/20'
                          }`}
                        >
                          {log.role}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-zinc-300">
                        {log.loginMethod}
                      </td>
                      <td className="p-4 font-mono text-zinc-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            log.status === 'SUCCESS'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                              : 'bg-red-950/60 text-red-400 border border-red-500/40'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMERS DIRECTORY */}
        {activeTab === 'CUSTOMERS' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-100">
                Registered Connoisseur Directory
              </h2>
              <p className="text-xs text-zinc-400">
                Customer profiles, order frequency, total spend, and recent activity
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl p-6 bg-obsidian-900/90 border border-zinc-800 hover:border-amber-500/30 transition-all shadow-xl space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-base font-bold text-gold-100">{c.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1 font-mono">
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{c.phoneNumber}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-[10px] font-bold text-gold-300">
                      PATRON
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-obsidian-950 border border-zinc-850 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Total Spent</span>
                      <span className="font-serif text-base font-bold text-gold-300">
                        {formatINR(c.totalSpent)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase">Orders Placed</span>
                      <span className="font-serif text-base font-bold text-zinc-200">
                        {c.completedOrders} / {c.totalOrders}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-500 pt-1 flex justify-between">
                    <span>Joined: {new Date(c.createdAt).toLocaleDateString()}</span>
                    <span>Last Login: {c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY & LOCKS */}
        {activeTab === 'INVENTORY' && (
          <div className="space-y-12">
            <ReservationMonitor
              items={stockItems}
              onReleaseHold={handleReleaseHold}
              onTriggerCleanup={handleTriggerCleanup}
            />
            <StockCounterGrid
              items={stockItems}
              onRefresh={fetchStock}
              onRestock={handleRestock}
            />
          </div>
        )}

        {/* TAB 4: REVENUE ANALYTICS */}
        {activeTab === 'ANALYTICS' && analytics && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-zinc-100">
                Financial Revenue & Operational Metrics
              </h2>
              <p className="text-xs text-zinc-400">
                Gross sales, batch volume, order status distribution, and active reservation holds
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-amber-500/30 space-y-2">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Gross Revenue (Confirmed)
                </span>
                <span className="font-serif text-3xl font-black text-gold-300">
                  {formatINR(analytics.totalRevenue)}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Total Tubs Dispatched
                </span>
                <span className="font-serif text-3xl font-black text-zinc-100">
                  {analytics.tubsSold} Tubs
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-zinc-800 space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                  Total Order Tickets
                </span>
                <span className="font-serif text-3xl font-black text-zinc-100">
                  {analytics.totalOrders}
                </span>
              </div>

              <div className="p-6 rounded-3xl bg-obsidian-900/90 border border-gold-500/30 space-y-2">
                <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider block">
                  Active 10-Min Holds
                </span>
                <span className="font-serif text-3xl font-black text-gold-300">
                  {analytics.activeHolds} Holds
                </span>
              </div>
            </div>

            {/* Order Status Breakdown */}
            <div className="p-6 rounded-3xl bg-obsidian-900 border border-zinc-800 space-y-4">
              <h3 className="font-serif text-lg font-bold text-zinc-100">
                Order Pipeline Distribution
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-zinc-850 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Pending Payment</span>
                  <span className="font-serif text-xl font-bold text-gold-400">
                    {analytics.orderStatusCounts.pending}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-zinc-850 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Paid & Verified</span>
                  <span className="font-serif text-xl font-bold text-emerald-400">
                    {analytics.orderStatusCounts.paid}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-zinc-850 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">In Cryo-Prep</span>
                  <span className="font-serif text-xl font-bold text-amber-400">
                    {analytics.orderStatusCounts.preparing}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-zinc-850 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Dispatched</span>
                  <span className="font-serif text-xl font-bold text-blue-400">
                    {analytics.orderStatusCounts.outForDelivery}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-zinc-850 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Delivered</span>
                  <span className="font-serif text-xl font-bold text-zinc-300">
                    {analytics.orderStatusCounts.delivered}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-zinc-850 text-center">
                  <span className="text-[10px] text-zinc-500 uppercase block">Cancelled / Expired</span>
                  <span className="font-serif text-xl font-bold text-red-400">
                    {analytics.orderStatusCounts.cancelled}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
