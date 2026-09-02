'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Crown, ChefHat, Truck, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export default function CentralPortalSwitcherPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-obsidian-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-gold-500/15 via-gold-500/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gold-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#d4af3708_1px,transparent_1px),linear-gradient(to_bottom,#d4af3708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative w-full max-w-4xl my-8 space-y-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-20 h-20 rounded-full border-2 border-gold-500/60 bg-gradient-to-b from-obsidian-900 to-obsidian-950 flex items-center justify-center shadow-gold-md">
            <div className="absolute inset-1 rounded-full border border-gold-400/30 animate-pulse" />
            <span className="font-serif font-black text-3xl text-gold-300 tracking-wider">H</span>
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-[0.2em] text-gold-100 uppercase mt-4">
              Hemanth Ice Creams
            </h1>
            <p className="text-xs sm:text-sm tracking-[0.3em] text-gold-400/90 font-medium uppercase mt-1">
              Haute Glacerie Private Vault Entrance
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300">
            <Lock className="w-3.5 h-3.5 text-gold-400" />
            <span>Select Your Designated Authentication Portal</span>
          </div>
        </div>

        {/* 3 Dedicated Role Portals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Customer Portal */}
          <Link
            href="/login/customer"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-obsidian-900/90 border border-gold-500/30 hover:border-gold-400 hover:bg-gold-500/10 transition-all duration-300 shadow-xl hover:shadow-gold-md backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest block">
                  Portal 01 • Connoisseurs
                </span>
                <h3 className="font-serif text-xl font-bold text-gold-100 group-hover:text-gold-300 transition-colors mt-1">
                  Customer Vault
                </h3>
              </div>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Access the interactive 3D tub customizer, explore the 6 Grand Cru formulations, and place orders with Demo UPI.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gold-500/20 flex items-center justify-between text-xs font-semibold text-gold-400">
              <span>Enter Storefront</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Admin Portal */}
          <Link
            href="/login/admin"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-obsidian-900/90 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-300 shadow-xl hover:shadow-gold-md backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Portal 02 • Master Control
                </span>
                <h3 className="font-serif text-xl font-bold text-zinc-100 group-hover:text-amber-300 transition-colors mt-1">
                  Master Admin
                </h3>
              </div>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Inspect live login audit trails, manage registered customer directories, review revenue analytics, and oversee stock.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Admin Chamber</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Kitchen Portal */}
          <Link
            href="/login/kitchen"
            className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-obsidian-900/90 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 backdrop-blur-md"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
                  Portal 03 • Cryo-Station
                </span>
                <h3 className="font-serif text-xl font-bold text-zinc-100 group-hover:text-blue-300 transition-colors mt-1">
                  Kitchen Dispatch
                </h3>
              </div>
              <p className="text-xs text-zinc-300 font-light leading-relaxed">
                Live order ticket queue, preparation workflow advancement, packaging quantities, and courier dispatch logs.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-500/20 flex items-center justify-between text-xs font-semibold text-blue-400">
              <span>Dispatch Station</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Security Footer */}
        <div className="border-t border-zinc-800/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold-400" />
            <span>Strict Role Isolation (RBAC) • Separate Backend Data Pipelines</span>
          </div>
          <span>© 2026 Hemanth Ice Creams Haute Glacerie</span>
        </div>
      </div>
    </main>
  );
}
