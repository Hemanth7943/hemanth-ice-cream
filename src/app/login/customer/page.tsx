'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Crown,
  Sparkles,
  Phone,
  User,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

function CustomerLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { isAuthenticated, role, loginCustomerOtp, sendCustomerOtp, loginCustomerVip, isLoading } =
    useAuth();

  const [authMode, setAuthMode] = useState<'VIP_QUICK' | 'OTP'>('VIP_QUICK');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [name, setName] = useState('Lord Hemanth');
  const [otp, setOtp] = useState('777888');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && role === 'CUSTOMER') {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, role, isLoading, router, redirectUrl]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await sendCustomerOtp(phoneNumber, name);
    setSubmitting(false);

    if (result.success) {
      setDemoHint(`Passcode: ${result.demoOtp || '777888'}`);
      setStep('OTP');
    } else {
      setError(result.error || 'Failed to dispatch customer passcode');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await loginCustomerOtp(phoneNumber, otp, name);
    setSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error || 'Invalid passcode');
    }
  };

  const handleVipQuickLogin = async () => {
    setSubmitting(true);
    setError(null);

    const result = await loginCustomerVip();
    setSubmitting(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(result.error || 'VIP Login failed');
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-gold-500/15 via-gold-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-lg my-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-gold-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch Portal</span>
          </Link>
          <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20">
            Customer Chamber
          </span>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-gold-sm">
            <Crown className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-black text-gold-100 uppercase tracking-wider">
            Customer Vault
          </h2>
          <p className="text-xs text-zinc-400">
            Sign in to inspect the 3D Stage, select Grand Cru tubs & order
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-obsidian-900/90 border border-gold-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-zinc-100 space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-obsidian-950 border border-zinc-800">
            <button
              type="button"
              onClick={() => setAuthMode('VIP_QUICK')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                authMode === 'VIP_QUICK'
                  ? 'bg-gold-gradient text-obsidian-950 font-bold shadow-gold-sm'
                  : 'text-zinc-400 hover:text-gold-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>1-Click VIP Patron</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('OTP')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                authMode === 'OTP'
                  ? 'bg-gold-gradient text-obsidian-950 font-bold shadow-gold-sm'
                  : 'text-zinc-400 hover:text-gold-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Mobile Passcode</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'VIP_QUICK' ? (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400 text-center">
                Instant single-click VIP patron access:
              </p>

              <button
                type="button"
                disabled={submitting}
                onClick={handleVipQuickLogin}
                className="w-full group p-5 rounded-2xl bg-obsidian-950 border border-gold-500/40 hover:border-gold-400 hover:bg-gold-500/10 text-left flex items-center justify-between transition-all duration-300 shadow-gold-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-gold-100">
                        Lord Hemanth
                      </span>
                      <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 text-[10px] font-bold uppercase">
                        VIP Patron
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      +91 98765 43210 • 3D Customizer & Vault
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gold-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          ) : (
            <div>
              {demoHint && step === 'OTP' && (
                <div className="mb-4 p-3 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  <span>{demoHint} (Pre-filled for fast testing)</span>
                </div>
              )}

              {step === 'PHONE' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400/80" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Lord Hemanth"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 text-sm outline-none text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400/80" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 text-sm outline-none text-zinc-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gold-gradient text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-md hover:brightness-110 active:scale-95 transition-all"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Dispatch Concierge Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="space-y-1.5 text-center">
                    <label className="text-xs font-semibold text-gold-400 uppercase tracking-wider block">
                      Enter 6-Digit Passcode
                    </label>
                    <div className="relative max-w-[280px] mx-auto">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="777888"
                        className="w-full py-3 rounded-xl bg-obsidian-950 border border-gold-500/50 focus:border-gold-400 text-center tracking-[0.5em] font-mono text-2xl font-bold outline-none text-gold-300 shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('PHONE')}
                      className="w-1/3 py-3 rounded-xl bg-obsidian-800 text-zinc-300 text-xs font-semibold uppercase hover:bg-obsidian-750 transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-2/3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-obsidian-950 font-bold text-xs uppercase tracking-wider shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Verify & Enter</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-2 text-[10px] text-zinc-500 tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Customer Role Isolated • No Staff Access</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <CustomerLoginContent />
    </Suspense>
  );
}
