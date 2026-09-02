import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `HIC-${dateStr}-${randomSuffix}`;
}

export function calculateCartTotals(items: { price: number; quantity: number }[]) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const taxRate = 0.05; // 5% luxury confectionery GST
  const tax = Math.round(subtotal * taxRate);
  const deliveryFee = subtotal >= 1000 ? 0 : 50; // Free delivery above ₹1000
  const totalAmount = subtotal + tax + deliveryFee;

  return {
    subtotal,
    tax,
    deliveryFee,
    totalAmount,
  };
}
