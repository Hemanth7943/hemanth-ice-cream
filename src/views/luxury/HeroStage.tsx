'use client';

import React from 'react';
import { TubCanvas } from '@/views/3d/TubCanvas';
import { SceneControls } from '@/views/3d/SceneControls';
import { FlavourConfig } from '@/views/3d/TextureGenerator';
import { formatINR } from '@/lib/utils';
import { Plus, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface FlavourWithInventory extends FlavourConfig {
  id: string;
  description: string;
  tastingNotes: string;
  ingredients: string;
  inventory: {
    id: string;
    size: 'G500' | 'G1000';
    sizeLabel: string;
    price: number;
    stockQuantity: number;
    reservedQuantity: number;
    availableStock: number;
    isAvailable: boolean;
  }[];
}

interface HeroStageProps {
  flavours: FlavourWithInventory[];
  selectedFlavourIndex: number;
  onSelectFlavour: (index: number) => void;
  selectedSize: 'G500' | 'G1000';
  onSelectSize: (size: 'G500' | 'G1000') => void;
  onAddToCart: (flavour: FlavourWithInventory, size: 'G500' | 'G1000') => void;
}

export const HeroStage: React.FC<HeroStageProps> = ({
  flavours,
  selectedFlavourIndex,
  onSelectFlavour,
  selectedSize,
  onSelectSize,
  onAddToCart,
}) => {
  const currentFlavour = flavours[selectedFlavourIndex] || flavours[0];
  if (!currentFlavour) return null;

  const currentInventory = currentFlavour.inventory.find((i) => i.size === selectedSize);
  const inv500 = currentFlavour.inventory.find((i) => i.size === 'G500');
  const inv1000 = currentFlavour.inventory.find((i) => i.size === 'G1000');

  const price500 = inv500?.price || 380;
  const price1000 = inv1000?.price || 690;
  const available500 = inv500?.availableStock ?? 0;
  const available1000 = inv1000?.availableStock ?? 0;
  const currentAvailable = currentInventory?.availableStock ?? 0;
  const isOutOfStock = currentAvailable <= 0;

  return (
    <section className="relative overflow-hidden pt-6 pb-16 lg:py-16">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ backgroundColor: currentFlavour.accentColor }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Tasting Notes & Flavour Story */}
          <div className="lg:col-span-5 space-y-6 text-left order-2 lg:order-1">
            {/* Flavour Badge */}
            {currentFlavour.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs tracking-widest uppercase font-semibold shadow-gold-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>{currentFlavour.badge}</span>
              </div>
            )}

            {/* Flavour Title */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gold-100 leading-tight">
                {currentFlavour.name}
              </h1>
              <p className="mt-2 text-base text-gold-400 font-serif italic">
                “{currentFlavour.tagline}”
              </p>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed font-light">
              {currentFlavour.description}
            </p>

            {/* Tasting Notes Card */}
            <div className="p-4 rounded-xl bg-obsidian-900/70 border border-gold-500/15 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sommelier Tasting Notes</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 italic font-serif">
                {currentFlavour.tastingNotes}
              </p>
            </div>

            {/* Pure Ingredients */}
            <div className="text-xs text-zinc-400">
              <span className="font-semibold text-gold-500/90 tracking-wider uppercase">
                Crafted With:{' '}
              </span>
              <span>{currentFlavour.ingredients}</span>
            </div>

            {/* Price & Add to Vault Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-400 tracking-wider uppercase font-medium">
                  Artisanal Price ({selectedSize === 'G500' ? '500g' : '1000g'})
                </span>
                <span className="font-serif text-3xl font-bold text-gold-300">
                  {formatINR(currentInventory?.price || 0)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onAddToCart(currentFlavour, selectedSize)}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 shadow-gold-md ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : 'bg-gold-gradient text-obsidian-950 hover:brightness-110 hover:shadow-gold-lg active:scale-95'
                }`}
              >
                {isOutOfStock ? (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Batch Sold Out</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-obsidian-950 stroke-[3]" />
                    <span>Reserve To Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: 3D Canvas Viewport & Controls */}
          <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2 space-y-4">
            <div className="relative w-full aspect-square max-w-[540px] rounded-3xl bg-gradient-to-b from-obsidian-900/90 via-obsidian-950 to-obsidian-900/90 border border-gold-500/25 shadow-2xl p-2 flex items-center justify-center">
              <TubCanvas flavour={currentFlavour} size={selectedSize} />
            </div>

            {/* Size switcher & stock status */}
            <div className="w-full max-w-[540px]">
              <SceneControls
                selectedSize={selectedSize}
                onSizeChange={onSelectSize}
                price500={price500}
                price1000={price1000}
                available500={available500}
                available1000={available1000}
              />
            </div>
          </div>
        </div>

        {/* Bottom Flavour Swapping Bar */}
        <div className="mt-14 pt-8 border-t border-gold-500/15">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-widest text-gold-400 uppercase">
              Select Signature Creation (6 Grand Crus)
            </span>
            <span className="text-xs text-zinc-400">Instant 3D Texture Mapping</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {flavours.map((flavour, idx) => {
              const isSelected = idx === selectedFlavourIndex;
              return (
                <button
                  key={flavour.id}
                  type="button"
                  onClick={() => onSelectFlavour(idx)}
                  className={`relative p-3 rounded-xl text-left transition-all duration-300 border flex flex-col justify-between min-h-[90px] ${
                    isSelected
                      ? 'bg-obsidian-800/90 border-gold-400 shadow-gold-sm ring-1 ring-gold-400/50'
                      : 'bg-obsidian-950/60 border-zinc-800 hover:border-gold-500/40 hover:bg-obsidian-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="w-3 h-3 rounded-full border border-gold-500/40 shadow-inner"
                      style={{ backgroundColor: flavour.primaryColor }}
                    />
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-gold-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gold-100 line-clamp-1 font-serif">
                      {flavour.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">
                      From {formatINR(flavour.inventory[0]?.price || 320)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
