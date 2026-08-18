import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

export function getPriceChangeColor(current: number, target: number, type: 'buy' | 'sell'): string {
  if (type === 'buy') {
    return current <= target ? 'text-green-600' : 'text-gray-900';
  }
  return current >= target ? 'text-red-600' : 'text-gray-900';
}

export function calculateChangePercent(current: number, target: number): number {
  if (target === 0) return 0;
  return ((current - target) / target) * 100;
}