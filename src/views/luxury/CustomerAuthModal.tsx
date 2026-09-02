'use client';

import React, { useState } from 'react';
import { X, Sparkles, Phone, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; phoneNumber: string }) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [name, setName] = useState('Lord Hemanth');
  const [otp, setOtp] = useState('777888');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoHint, setDemoHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, name }),
      });
      const data = await res.json();

      if (data.success) {
        setDemoHint(`Demo OTP: ${data.demoOtp || '777888'}`);
        setStep('OTP');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp, name }),
      });
      const data = await res.json();

      if (data.success) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Verification error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-gold-lg text-zinc-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-gold-200 hover:bg-obsidian-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-full bg-gold-gradient-soft border border-gold-500/40 flex items-center justify-center shadow-gold-sm">
            <Sparkles className="w-5 h-5 text-gold-400" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gold-100">
            {step === 'PHONE' ? 'Concierge Identification' : 'Verify Passcode'}
          </h3>
          <p className="text-xs text-zinc-400 font-light">
            {step === 'PHONE'
              ? 'Access your private reservations and VIP orders'
              : `Dispatched 6-digit access code to ${phoneNumber}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs text-center">
            {error}
          </div>
        )}

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
                Full Name / Salutation
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lord Hemanth"
                className="w-full px-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm outline-none text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                Phone Number (Mobile)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400" />
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-sm outline-none text-zinc-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gold-gradient text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Dispatch Passcode</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                6-Digit Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="777888"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-center tracking-[0.5em] font-mono text-lg outline-none text-gold-300"
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
                disabled={loading}
                className="w-2/3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gold-gradient text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify & Enter</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
