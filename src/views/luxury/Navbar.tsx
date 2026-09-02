'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, QrCode, Sparkles, User as UserIcon, LogOut, Crown, ChefHat, Truck } from 'lucide-react';
import { QRContextDTO } from '@/models/schemas';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth?: () => void;
  currentUser?: { name: string; phoneNumber: string; role?: string } | null;
  qrContext?: QRContextDTO | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  qrContext,
}) => {
  const { user, logout } = useAuth();

  const getRoleIcon = () => {
    if (!user) return <UserIcon className="w-3.5 h-3.5 text-gold-400" />;
    if (user.role === 'ADMIN') return <ChefHat className="w-3.5 h-3.5 text-amber-400" />;
    if (user.role === 'KITCHEN') return <Truck className="w-3.5 h-3.5 text-blue-400" />;
    return <Crown className="w-3.5 h-3.5 text-gold-400" />;
  };

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'ADMIN') return 'Master Admin';
    if (user.role === 'KITCHEN') return 'Kitchen';
    return 'VIP Patron';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-obsidian-950/85 backdrop-blur-xl border-b border-gold-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Monogram */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-full border border-gold-500/50 bg-gold-gradient-soft flex items-center justify-center shadow-gold-sm group-hover:border-gold-400 transition-colors">
            <span className="font-serif font-bold text-gold-400 text-xl tracking-wider">H</span>
          </div>
          <div>
            <span className="font-serif font-bold text-base sm:text-lg tracking-[0.2em] text-gold-100 uppercase block">
              Hemanth
            </span>
            <span className="text-[10px] tracking-[0.3em] text-gold-500/90 uppercase block font-medium">
              Haute Glacerie
            </span>
          </div>
        </Link>

        {/* QR Context Badge (If arrived via QR code) */}
        {qrContext && (qrContext.table || qrContext.zone || qrContext.stand) && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs">
            <QrCode className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-medium">
              {qrContext.zone || qrContext.stand || 'Concierge'} {qrContext.table ? `• Table ${qrContext.table}` : ''}
            </span>
          </div>
        )}

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Admin / Kitchen Live Dispatch Portal */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gold-300/80 hover:text-gold-200 hover:bg-gold-500/10 transition-colors border border-gold-500/15"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">Kitchen & Inventory</span>
          </Link>

          {/* User Profile & Role Tag */}
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-obsidian-900 border border-gold-500/30 text-xs">
              {getRoleIcon()}
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-serif font-semibold text-gold-100 leading-none">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-gold-400 font-medium uppercase tracking-wider">
                  {getRoleBadge()}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="ml-1 p-1 rounded-md text-zinc-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                title="Sign Out from Vault"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-gold-200 hover:bg-obsidian-800 transition-colors border border-zinc-800"
            >
              <UserIcon className="w-3.5 h-3.5 text-gold-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Luxury Cart Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-gradient text-obsidian-950 font-semibold text-xs tracking-wider uppercase shadow-gold-sm hover:brightness-110 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4 text-obsidian-950" />
            <span className="hidden xs:inline">Vault</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-obsidian-950 text-gold-300 text-[11px] font-bold flex items-center justify-center shadow-inner">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
