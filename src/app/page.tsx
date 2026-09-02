'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/views/luxury/Navbar';
import { QRLandingBanner } from '@/views/luxury/QRLandingBanner';
import { HeroStage, FlavourWithInventory } from '@/views/luxury/HeroStage';
import { FlavourCardList } from '@/views/luxury/FlavourCardList';
import { LuxuryCartDrawer } from '@/views/luxury/LuxuryCartDrawer';
import { CheckoutModal } from '@/views/luxury/CheckoutModal';
import { OrderConfirmationModal } from '@/views/luxury/OrderConfirmationModal';
import { CartItemDTO, QRContextDTO } from '@/models/schemas';
import { Loader2, Sparkles, Lock } from 'lucide-react';
import LoginPage from './login/page';

export default function LuxuryStorefrontPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [flavours, setFlavours] = useState<FlavourWithInventory[]>([]);
  const [selectedFlavourIndex, setSelectedFlavourIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<'G500' | 'G1000'>('G500');

  // Client modals and cart state
  const [cart, setCart] = useState<CartItemDTO[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [qrContext, setQrContext] = useState<QRContextDTO | null>(null);

  // 1. Fetch real-time flavours and inventory only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function fetchCatalog() {
      try {
        const res = await fetch('/api/flavours');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setFlavours(json.data);
          }
        }
      } catch (e) {
        console.warn('API catalog fetch failed');
      }
    }
    fetchCatalog();
  }, [isAuthenticated]);

  // 2. Parse and hydrate QR context from URL or sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const table = params.get('table');
      const stand = params.get('stand');
      const zone = params.get('zone');
      const deliveryZone = params.get('deliveryZone');

      if (table || stand || zone || deliveryZone) {
        const ctx: QRContextDTO = {
          table: table || undefined,
          stand: stand || undefined,
          zone: zone || undefined,
          deliveryZone: deliveryZone || undefined,
        };
        setQrContext(ctx);
        sessionStorage.setItem('hemanth_qr_context', JSON.stringify(ctx));
      } else {
        const stored = sessionStorage.getItem('hemanth_qr_context');
        if (stored) {
          try {
            setQrContext(JSON.parse(stored));
          } catch (e) {}
        }
      }
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex flex-col items-center justify-center text-gold-400 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="font-serif tracking-widest text-xs uppercase text-gold-300">
          Unlocking Haute Glacerie Vault...
        </span>
      </div>
    );
  }

  // Security Gate: If not authenticated, render login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Add Item to Cart
  const handleAddToCart = (flavour: FlavourWithInventory, size: 'G500' | 'G1000') => {
    const inv = flavour.inventory.find((i) => i.size === size);
    if (!inv || inv.availableStock <= 0) return;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.flavourId === flavour.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      return [
        ...prev,
        {
          inventoryItemId: inv.id,
          flavourId: flavour.id,
          flavourName: flavour.name,
          size: size,
          price: inv.price,
          quantity: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCart((prev) => {
      const updated = [...prev];
      if (quantity <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-zinc-100 relative">
      {/* Luxury Navigation Bar */}
      <Navbar
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={user}
        qrContext={qrContext}
      />

      {/* QR Seating / Zone Context Banner */}
      {qrContext && <QRLandingBanner qrContext={qrContext} />}

      {/* Interactive 3D Hero Stage */}
      {flavours.length > 0 && (
        <HeroStage
          flavours={flavours}
          selectedFlavourIndex={selectedFlavourIndex}
          onSelectFlavour={setSelectedFlavourIndex}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Complete Signature 6-Flavour Catalog */}
      {flavours.length > 0 && (
        <FlavourCardList
          flavours={flavours}
          onSelectFlavour={setSelectedFlavourIndex}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Slide-out Luxury Cart */}
      <LuxuryCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Encrypted Vault Checkout Modal with Demo UPI */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        qrContext={qrContext}
        currentUser={user}
        onOrderSuccess={(order) => setConfirmedOrder(order)}
        onClearCart={() => setCart([])}
      />

      {/* Order Confirmed Receipt Modal */}
      <OrderConfirmationModal
        isOpen={!!confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        order={confirmedOrder}
      />

      {/* Footer */}
      <footer className="border-t border-gold-500/15 py-12 bg-obsidian-950 text-center text-xs text-zinc-500 space-y-3">
        <div className="flex items-center justify-center gap-2 text-gold-400 font-serif text-sm">
          <Sparkles className="w-4 h-4" />
          <span>HEMANTH ICE CREAMS • MAÎTRE GLACIER</span>
          <Sparkles className="w-4 h-4" />
        </div>
        <p>© 2026 Hemanth Ice Creams. Handcrafted in 500g & 1000g Family Tubs. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
