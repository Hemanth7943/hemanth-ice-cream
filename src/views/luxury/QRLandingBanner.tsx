'use client';

import React from 'react';
import { QrCode, MapPin, Sparkles } from 'lucide-react';
import { QRContextDTO } from '@/models/schemas';

interface QRLandingBannerProps {
  qrContext?: QRContextDTO | null;
}

export const QRLandingBanner: React.FC<QRLandingBannerProps> = ({ qrContext }) => {
  if (!qrContext || (!qrContext.table && !qrContext.stand && !qrContext.zone && !qrContext.deliveryZone)) {
    return null;
  }

  const locationTitle =
    qrContext.zone || qrContext.stand || qrContext.deliveryZone || 'Exclusive Lounge';
  const tableTitle = qrContext.table ? `Table ${qrContext.table}` : 'Concierge Order';

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-gold-900/40 via-obsidian-900 to-gold-900/40 border-b border-gold-500/25 px-4 py-3 text-gold-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-gold-500/20 text-gold-400">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-gold-400 font-semibold tracking-wider uppercase">
              QR Concierge Connected:
            </span>{' '}
            <span className="text-zinc-200 font-medium">
              {locationTitle} ({tableTitle})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gold-400/80 tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Priority Kitchen Expediting Enabled</span>
        </div>
      </div>
    </div>
  );
};
