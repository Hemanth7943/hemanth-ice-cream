'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  ChefHat,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Lock,
  AlertTriangle,
  FileText,
} from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const { isAuthenticated, role, loginAdmin, loginAdminQuick, isLoading } = useAuth();

  const [pin, setPin] = useState('9999');
  const [secretKey, setSecretKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [isAuthenticated, role, isLoading, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await loginAdmin(pin, secretKey);
    setSubmitting(false);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Invalid Admin Passcode or Secret Key');
    }
  };

  const handleQuickAdminLogin = async () => {
    setSubmitting(true);
    setError(null);

    const result = await loginAdminQuick();
    setSubmitting(false);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Quick admin login failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold-400">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-obsidian-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/15 via-gold-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-lg my-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Portal</span>
          </Link>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20">
            Master Admin Clearance
          </span>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-gold-sm">
            <ChefHat className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-black text-gold-100 uppercase tracking-wider">
            Master Admin Chamber
          </h2>
          <p className="text-xs text-zinc-400">
            Executive control for login audit logs, customers, revenue & stock
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-obsidian-900/90 border border-amber-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-zinc-100 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Master Admin Trigger */}
          <div className="p-4 rounded-2xl bg-obsidian-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                1-Click Master Access
              </span>
              <span className="text-[10px] text-zinc-500">Chef Hemanth P</span>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleQuickAdminLogin}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-gold-600 text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  <span>Authenticate as Master Admin</span>
                </>
              )}
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-obsidian-900 px-3 text-[10px] text-zinc-500 uppercase tracking-widest">
              Or Enter Passcode
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Admin 4-Digit Security PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-400/80" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="9999"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-amber-500 text-sm font-mono tracking-widest outline-none text-amber-300"
                />
              </div>
              <span className="text-[10px] text-zinc-500 block">Default Admin PIN: 9999</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Master Secret Key (Optional)
              </label>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="CHEF-HEMANTH-ADMIN-2026"
                className="w-full px-4 py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-amber-500 text-xs font-mono outline-none text-zinc-300"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-obsidian-800 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Admin Credentials</span>}
            </button>
          </form>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[10px] text-zinc-500 tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Audit Logging Active • All Access Logged into DB</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <AdminLoginContent />
    </Suspense>
  );
}
