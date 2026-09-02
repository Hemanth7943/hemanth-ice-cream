'use client';

import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertCircle, Loader2, Compass } from 'lucide-react';
import { reverseGeocode, GeoCoordinates } from '@/lib/geo';

interface GPSAddressCardProps {
  address: string;
  onAddressChange: (address: string) => void;
  coordinates: GeoCoordinates | null;
  onCoordinatesChange: (coords: GeoCoordinates | null) => void;
}

export const GPSAddressCard: React.FC<GPSAddressCardProps> = ({
  address,
  onAddressChange,
  coordinates,
  onCoordinatesChange,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: GeoCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        onCoordinatesChange(coords);

        try {
          const resolved = await reverseGeocode(coords);
          if (resolved.formattedAddress) {
            onAddressChange(resolved.formattedAddress);
          }
        } catch (err) {
          console.warn('Reverse geocode error:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        // Provide mock luxury fallback coordinates for testing if user denies permission
        const fallbackCoords: GeoCoordinates = {
          latitude: 12.9716,
          longitude: 77.5946,
          accuracy: 15,
        };
        onCoordinatesChange(fallbackCoords);
        if (!address) {
          onAddressChange('Villa 14, Royal Palm Residences, Bengaluru, Karnataka 560001');
        }
        setGpsError('GPS permission skipped. Fallback luxury destination coordinates applied.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="p-5 rounded-2xl bg-obsidian-900/90 border border-gold-500/25 backdrop-blur-xl shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 tracking-wider uppercase">
          <Navigation className="w-4 h-4 text-gold-400" />
          <span>Concierge Delivery Location (GPS)</span>
        </div>

        <button
          type="button"
          onClick={handleFetchLocation}
          disabled={isLocating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 border border-gold-500/30 text-xs font-medium transition-all"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
              <span>Locating GPS...</span>
            </>
          ) : (
            <>
              <Compass className="w-3.5 h-3.5 text-gold-400" />
              <span>Pin GPS Drop</span>
            </>
          )}
        </button>
      </div>

      {/* Verified Coordinates Pill */}
      {coordinates && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Precision Lock: Lat {coordinates.latitude.toFixed(5)}, Lon {coordinates.longitude.toFixed(5)}
            {coordinates.accuracy ? ` (±${Math.round(coordinates.accuracy)}m)` : ''}
          </span>
        </div>
      )}

      {gpsError && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Address Input Field */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
          Destination Address / Residence Suite
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gold-400/80" />
          <textarea
            rows={2}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="e.g., Penthouse 4B, Imperial Towers, 100 Ft Road, Bengaluru"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian-950 border border-zinc-800 focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/60 text-zinc-100 placeholder-zinc-600 text-xs sm:text-sm outline-none transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
};
