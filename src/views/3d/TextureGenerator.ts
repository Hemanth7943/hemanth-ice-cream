import * as THREE from 'three';

export interface FlavourConfig {
  slug: string;
  name: string;
  tagline: string;
  badge?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  texturePattern: string;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Procedurally generates a high-definition luxury gold foil cylindrical label texture
 * for Hemanth Ice Creams tubs.
 */
export function generateTubTexture(flavour: FlavourConfig, sizeLabel: string = '500g'): THREE.CanvasTexture {
  const cacheKey = `${flavour.slug}_${sizeLabel}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  if (typeof document === 'undefined') {
    // Return empty texture on SSR
    return new THREE.CanvasTexture(new Image());
  }

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Rich Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, flavour.primaryColor);
  bgGrad.addColorStop(0.3, adjustColorBrightness(flavour.primaryColor, 15));
  bgGrad.addColorStop(0.7, flavour.primaryColor);
  bgGrad.addColorStop(1, adjustColorBrightness(flavour.primaryColor, -15));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Luxury Geometric Damask / Micro-pattern
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  const step = 64;
  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.arc(x + step / 2, y + step / 2, step / 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(x + step / 4, y + step / 4, step / 2, step / 2);
    }
  }
  ctx.restore();

  // 3. Gold Metallic Top & Bottom Foil Filigrees
  drawGoldFoilBorders(ctx, width, height);

  // 4. Front Label Vignette / Shield (Centered at X = width * 0.5)
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  // Background Gold Glow behind label
  const radialGlow = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 420);
  radialGlow.addColorStop(0, 'rgba(212, 175, 55, 0.18)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 420, 0, Math.PI * 2);
  ctx.fill();

  // Luxury Gold Crest Ring
  ctx.save();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 140, 65, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Crest 'H' Monogram
  ctx.font = 'bold 54px "Cinzel", "Playfair Display", Georgia, serif';
  ctx.fillStyle = '#D4AF37';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('H', centerX, centerY - 140);
  ctx.restore();

  // 5. Brand Header Typography
  ctx.save();
  ctx.font = '600 36px "Cinzel", "Playfair Display", serif';
  ctx.fillStyle = '#F3E5AB';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '12px';
  ctx.fillText('HEMANTH ICE CREAMS', centerX, centerY - 35);

  // Brand Sub-Header
  ctx.font = '300 20px "Inter", sans-serif';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText('MAÎTRE GLACIER • RESERVE ARTISANALE', centerX, centerY + 8);

  // Gold Divider Line with Diamond
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 240, centerY + 30);
  ctx.lineTo(centerX - 30, centerY + 30);
  ctx.moveTo(centerX + 30, centerY + 30);
  ctx.lineTo(centerX + 240, centerY + 30);
  ctx.stroke();

  // Center Diamond
  ctx.fillStyle = '#D4AF37';
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 24);
  ctx.lineTo(centerX + 8, centerY + 30);
  ctx.lineTo(centerX, centerY + 36);
  ctx.lineTo(centerX - 8, centerY + 30);
  ctx.closePath();
  ctx.fill();

  // 6. Main Flavour Title (Gold Gradient Text)
  ctx.font = 'bold 56px "Cinzel", "Playfair Display", serif';
  const textGrad = ctx.createLinearGradient(centerX - 300, centerY + 90, centerX + 300, centerY + 90);
  textGrad.addColorStop(0, '#FFFFFF');
  textGrad.addColorStop(0.5, '#FDF4D4');
  textGrad.addColorStop(1, '#D4AF37');
  ctx.fillStyle = textGrad;
  ctx.fillText(flavour.name.toUpperCase(), centerX, centerY + 90);

  // 7. Flavour Tagline
  ctx.font = 'italic 24px "Playfair Display", Georgia, serif';
  ctx.fillStyle = flavour.secondaryColor;
  ctx.fillText(`“${flavour.tagline}”`, centerX, centerY + 140);

  // 8. Badge Pill (e.g. "Signature Grand Cru")
  if (flavour.badge) {
    drawLuxuryBadge(ctx, flavour.badge, centerX, centerY + 210);
  }

  // 9. Size & Purity Details
  ctx.font = '600 22px "Inter", sans-serif';
  ctx.fillStyle = '#D4AF37';
  ctx.fillText(`NET WT. ${sizeLabel.toUpperCase()}  |  100% PURE JERSEY CREAM  |  EST. 2026`, centerX, centerY + 290);

  // Repeat Monogram on Back Side (Centered at X = 0 and X = width)
  drawBackLabel(ctx, 0, centerY, flavour, sizeLabel);
  drawBackLabel(ctx, width, centerY, flavour, sizeLabel);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

function drawGoldFoilBorders(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  // Top Border
  const topGrad = ctx.createLinearGradient(0, 0, width, 0);
  topGrad.addColorStop(0, '#8C6C16');
  topGrad.addColorStop(0.25, '#F9EDB6');
  topGrad.addColorStop(0.5, '#D4AF37');
  topGrad.addColorStop(0.75, '#F9EDB6');
  topGrad.addColorStop(1, '#8C6C16');

  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 40, width, 14);
  ctx.fillRect(0, 64, width, 3);

  // Bottom Border
  ctx.fillRect(0, height - 76, width, 3);
  ctx.fillRect(0, height - 54, width, 14);

  // Filigree repeating dots
  ctx.fillStyle = '#D4AF37';
  for (let x = 20; x < width; x += 40) {
    ctx.beginPath();
    ctx.arc(x, 24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, height - 24, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLuxuryBadge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  ctx.save();
  const textWidth = ctx.measureText(text.toUpperCase()).width + 50;
  const h = 40;

  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(212, 175, 55, 0.12)';

  ctx.beginPath();
  ctx.roundRect(x - textWidth / 2, y - h / 2, textWidth, h, 20);
  ctx.fill();
  ctx.stroke();

  ctx.font = '600 18px "Inter", sans-serif';
  ctx.fillStyle = '#FDF8E2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), x, y);
  ctx.restore();
}

function drawBackLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  centerY: number,
  flavour: FlavourConfig,
  sizeLabel: string
) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 22px "Cinzel", serif';
  ctx.fillText('HEMANTH ARTISAN RESERVE', x, centerY - 60);

  ctx.font = '16px "Inter", sans-serif';
  ctx.fillStyle = '#E5D6A7';
  ctx.fillText(`Handcrafted in small batches • ${sizeLabel}`, x, centerY - 25);
  ctx.fillText('Slow-churned with 100% natural organic ingredients', x, centerY + 5);
  ctx.fillText('Keep frozen at -18°C', x, centerY + 35);
  ctx.restore();
}

function adjustColorBrightness(hex: string, percent: number) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}
