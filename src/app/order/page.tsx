'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LuxuryStorefrontPage from '../page';
import { Loader2 } from 'lucide-react';

function OrderQRHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const table = searchParams.get('table');
    const stand = searchParams.get('stand');
    const zone = searchParams.get('zone');
    const deliveryZone = searchParams.get('deliveryZone');
    const campaign = searchParams.get('campaign');

    if (table || stand || zone || deliveryZone || campaign) {
      const qrContext = {
        table: table || undefined,
        stand: stand || undefined,
        zone: zone || undefined,
        deliveryZone: deliveryZone || undefined,
        campaign: campaign || undefined,
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hemanth_qr_context', JSON.stringify(qrContext));
      }
    }
  }, [searchParams]);

  return <LuxuryStorefrontPage />;
}

export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian-950 flex items-center justify-center text-gold-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <OrderQRHandler />
    </Suspense>
  );
}
