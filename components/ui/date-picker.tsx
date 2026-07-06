'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  /** Giá trị dạng chuỗi "YYYY-MM-DD" (rỗng = chưa chọn) */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Không cho chọn ngày sau hôm nay (mặc định: cho phép) */
  disableFuture?: boolean
  id?: string
  className?: string
}

// Parse "YYYY-MM-DD" thành Date local (tránh lệch timezone của new Date(str))
function parseLocalDate(str: string): Date | undefined {
  if (!str) return undefined
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function toLocalString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  disableFuture = false,
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = parseLocalDate(value)

  const label = selected
    ? selected.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors',
            'hover:border-[#768064]/40 focus-visible:ring-1 focus-visible:ring-ring',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="w-4 h-4 text-[#768064] shrink-0" />
          <span className="flex-1 text-left">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          startMonth={new Date(1940, 0)}
          endMonth={new Date(new Date().getFullYear(), 11)}
          disabled={disableFuture ? { after: new Date() } : undefined}
          onSelect={(date) => {
            if (date) {
              onChange(toLocalString(date))
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
