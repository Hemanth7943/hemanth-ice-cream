'use client';

import React from 'react';
import { Sparkles, PackageCheck } from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface SceneControlsProps {
  selectedSize: 'G500' | 'G1000';
  onSizeChange: (size: 'G500' | 'G1000') => void;
  price500: number;
  price1000: number;
  available500: number;
  available1000: number;
}

export const SceneControls: React.FC<SceneControlsProps> = ({
  selectedSize,
  onSizeChange,
  price500,
  price1000,
  available500,
  available1000,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-obsidian-900/90 border border-gold-500/20 backdrop-blur-xl shadow-2xl">
      {/* Tub Size Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-obsidian-950 border border-gold-500/20 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onSizeChange('G500')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            selectedSize === 'G500'
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-obsidian-950 font-semibold shadow-gold-sm'
              : 'text-zinc-400 hover:text-gold-200'
          }`}
        >
          <span>500g Tub</span>
          <span className="text-xs opacity-80">({formatINR(price500)})</span>
        </button>

        <button
          type="button"
          onClick={() => onSizeChange('G1000')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
            selectedSize === 'G1000'
              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-obsidian-950 font-semibold shadow-gold-sm'
              : 'text-zinc-400 hover:text-gold-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1000g Family Tub</span>
          <span className="text-xs opacity-80">({formatINR(price1000)})</span>
        </button>
      </div>

      {/* Stock Status Indicator */}
      <div className="flex items-center gap-3 text-xs tracking-wider">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <PackageCheck className="w-3.5 h-3.5" />
          <span>
            {selectedSize === 'G500' ? available500 : available1000} Tubs In Fresh Vault
          </span>
        </div>
      </div>
    </div>
  );
};
