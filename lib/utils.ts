import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAmountK(n: number) {
  if (!Number.isFinite(n) || n === 0) return '0k'
  const thousands = n / 1000
  if (thousands >= 1000) {
    return `${(thousands / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}M`
  }
  return `${Number.isInteger(thousands) ? thousands.toLocaleString('vi-VN') : thousands.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}k`
}
