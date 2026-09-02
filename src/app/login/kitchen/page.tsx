'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Truck,
  Sparkles,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

function KitchenLoginContent() {
  const router = useRouter();
  const { isAuthenticated, role, loginKitchen, loginKitchenQuick, isLoading } = useAuth();

  const [pin, setPin] = useState('8888');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && (role === 'KITCHEN' || role === 'ADMIN')) {
      router.replace('/kitchen');
    }
  }, [isAuthenticated, role, isLoading, router]);

  const handleKitchenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await loginKitchen(pin);
    setSubmitting(false);

    if (result.success) {
      router.push('/kitchen');
    } else {
      setError(result.error || 'Invalid Kitchen Staff PIN');
    }
  };

  const handleQuickKitchenLogin = async () => {
    setSubmitting(true);
    setError(null);

    const result = await loginKitchenQuick();
    setSubmitting(false);

    if (result.success) {
      router.push('/kitchen');
    } else {
      setError(result.error || 'Quick kitchen login failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-blue-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-obsidian-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-500/15 via-blue-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-lg my-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Portal</span>
          </Link>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20">
            Kitchen Station Staff
          </span>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-lg">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-black text-zinc-100 uppercase tracking-wider">
            Kitchen Dispatch
          </h2>
          <p className="text-xs text-zinc-400">
            Sub-zero cryo-packaging queue & live dispatch ticket pipeline
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-obsidian-900/90 border border-blue-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-zinc-100 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Staff Access */}
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                1-Click Station Login
              </span>
              <span className="text-[10px] text-zinc-500">Dispatch Team</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleQuickKitchenLogin}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Authenticate Kitchen Terminal</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-obsidian-900 px-3 text-[10px] text-zinc-500 uppercase tracking-widest">
              Or Enter Station PIN
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleKitchenLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider block">
                Station Staff 4-Digit PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-400/80" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="8888"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-blue-500 text-sm font-mono tracking-widest outline-none text-blue-300"
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">Default Kitchen PIN: 8888</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-obsidian-800 hover:bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold text-xs uppercase tracking-wider transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Open Dispatch Station</span>}
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[10px] text-zinc-500 tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Kitchen Terminal Isolated • No Storefront or Admin Access</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function KitchenLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-blue-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <KitchenLoginContent />
    </Suspense>
  );
}
