'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  value: number | string
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  id?: string
  placeholder?: string
  className?: string
}

// Ô nhập số với stepper tùy biến hợp theme tối (ẩn spinner mặc định của trình duyệt)
export function NumberInput({
  value, onChange, min, max, step = 1, id, placeholder, className,
}: NumberInputProps) {
  const num = typeof value === 'number' ? value : parseFloat(value || '0') || 0

  const clamp = (n: number) => {
    if (min !== undefined && n < min) return min
    if (max !== undefined && n > max) return max
    return n
  }

  const bump = (dir: 1 | -1) => onChange(String(clamp(num + dir * step)))

  return (
    <div className={cn(
      'relative flex h-9 w-full items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow]',
      'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
      className,
    )}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full min-w-0 bg-transparent px-3 py-1 text-base outline-none placeholder:text-muted-foreground md:text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="flex flex-col shrink-0 border-l border-input/60">
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tăng"
          onClick={() => bump(1)}
          className="flex h-[18px] w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-purple-500/10 hover:text-purple-300 rounded-tr-md"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Giảm"
          onClick={() => bump(-1)}
          className="flex h-[18px] w-7 items-center justify-center text-muted-foreground transition-colors hover:bg-purple-500/10 hover:text-purple-300 rounded-br-md border-t border-input/60"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
