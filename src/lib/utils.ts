
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number with commas as thousands separators
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Round number to specified decimal places
export function roundToDecimals(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
