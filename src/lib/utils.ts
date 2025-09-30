// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getExplorerUrl(hashOrAddress: string, type: 'transaction' | 'account' | 'object') {
  const explorerBaseUrl = "https://explorer.aptoslabs.com";
  const explorerType = type === 'transaction' ? 'txn' : type;
  return `${explorerBaseUrl}/${explorerType}/${hashOrAddress}?network=testnet`;
}

// --- MOVED FROM MOCKDATA ---
export const calculateProgress = (totalDonated: number, goalAmount: number): number => {
  if (goalAmount === 0) return 0;
  return Math.min((totalDonated / goalAmount) * 100, 100);
};

export const formatAPT = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getTimeRemaining = (endTimestamp: number): string => {
  const now = Date.now();
  const diff = endTimestamp - now;
  if (diff <= 0) return "Campaign ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;
  return `${hours} hour${hours !== 1 ? 's' : ''} left`;
};