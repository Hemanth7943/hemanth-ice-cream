'use client';

import React from 'react';
import { FlavourWithInventory } from './HeroStage';
import { formatINR } from '@/lib/utils';
import { Sparkles, ShoppingBag, Eye } from 'lucide-react';

interface FlavourCardListProps {
  flavours: FlavourWithInventory[];
  onSelectFlavour: (index: number) => void;
  onAddToCart: (flavour: FlavourWithInventory, size: 'G500' | 'G1000') => void;
}

export const FlavourCardList: React.FC<FlavourCardListProps> = ({
  flavours,
  onSelectFlavour,
  onAddToCart,
}) => {
  return (
    <section className="py-16 bg-obsidian-950 border-t border-gold-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs tracking-widest uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>The Grand Cru Vault</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gold-100 tracking-tight">
            Six Masterpiece Formulations
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Individually batch-churned, sealed in 500g and 1000g temperature-guarded luxury containers.
          </p>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {flavours.map((flavour, index) => {
            const inv500 = flavour.inventory.find((i) => i.size === 'G500');
            const inv1000 = flavour.inventory.find((i) => i.size === 'G1000');
            const is500Available = (inv500?.availableStock ?? 0) > 0;
            const is1000Available = (inv1000?.availableStock ?? 0) > 0;

            return (
              <div
                key={flavour.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-obsidian-900/80 border border-gold-500/20 hover:border-gold-400/60 p-6 transition-all duration-300 hover:shadow-gold-md backdrop-blur-md"
              >
                {/* Top bar with badge and color dot */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-wider text-gold-400 uppercase px-2.5 py-1 rounded bg-gold-500/10 border border-gold-500/20">
                      {flavour.badge || 'Signature Reserve'}
                    </span>
                    <span
                      className="w-4 h-4 rounded-full border border-gold-500/50 shadow-inner"
                      style={{ backgroundColor: flavour.primaryColor }}
                    />
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-serif text-xl font-bold text-gold-100 group-hover:text-gold-300 transition-colors">
                      {flavour.name}
                    </h3>
                    <p className="text-xs text-gold-400/90 italic font-serif mt-1">
                      {flavour.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 leading-relaxed font-light line-clamp-3">
                    {flavour.description}
                  </p>

                  {/* Tasting notes snippet */}
                  <div className="p-3 rounded-lg bg-obsidian-950/80 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                    <span className="text-gold-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Notes:
                    </span>
                    <span className="italic font-serif">{flavour.tastingNotes}</span>
                  </div>
                </div>

                {/* Bottom Actions: Pricing & Add to Cart */}
                <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Packaging Sizes:</span>
                    <div className="flex gap-2">
                      <span className="text-gold-200 font-semibold">
                        500g ({formatINR(inv500?.price || 0)})
                      </span>
                      <span className="text-zinc-600">|</span>
                      <span className="text-gold-200 font-semibold">
                        1000g ({formatINR(inv1000?.price || 0)})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* 500g Add */}
                    <button
                      type="button"
                      disabled={!is500Available}
                      onClick={() => onAddToCart(flavour, 'G500')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        is500Available
                          ? 'bg-obsidian-800 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30'
                          : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>+ 500g</span>
                    </button>

                    {/* 1000g Add */}
                    <button
                      type="button"
                      disabled={!is1000Available}
                      onClick={() => onAddToCart(flavour, 'G1000')}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        is1000Available
                          ? 'bg-gold-gradient text-obsidian-950 font-bold hover:brightness-110 shadow-gold-sm'
                          : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>+ 1000g</span>
                    </button>
                  </div>

                  {/* 3D Inspect Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectFlavour(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-zinc-400 hover:text-gold-300 transition-colors"
                  >
                    <Eye className="w-3 h-3 text-gold-400" />
                    <span>Inspect In 3D Stage</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
