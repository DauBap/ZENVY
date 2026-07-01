'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Calendar, Trash2, Plus, Loader2, Save } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { TIME_SLOTS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export interface AvailabilityItem {
  id: number | null
  date: string // "YYYY-MM-DD"
  slots: string[]
}

export function ReaderAvailabilityTab({ initial }: { initial: AvailabilityItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState<AvailabilityItem[]>(initial)
  const [newDate, setNewDate] = useState('')
  const [busy, setBusy] = useState(false)
  
  const ICT_OFFSET_MS = 7 * 60 * 60 * 1000
  
  function isSlotPast(dateStr: string, slot: string) {
    const nowUtcMs = Date.now()
    const [y, m, d] = dateStr.split('-').map(Number)
    const [hh, mm] = slot.split(':').map(Number)
    // VN local time -> UTC ms: Date.UTC(year,month-1,day,hh,mm) gives UTC ms for that time
    // subtract ICT offset to convert VN local to actual UTC instant
    const slotUtcMs = Date.UTC(y, m - 1, d, hh, mm) - ICT_OFFSET_MS
    return slotUtcMs <= nowUtcMs
  }

  function addDate() {
    if (!newDate) { toast.error('Vui lòng chọn ngày.'); return }
    if (items.some((it) => it.date === newDate)) {
      toast.error('Ngày này đã có trong danh sách.')
      return
    }
    setItems((prev) => [...prev, { id: null, date: newDate, slots: [] }].sort((a, b) => a.date.localeCompare(b.date)))
    setNewDate('')
  }

  function toggleSlot(idx: number, slot: string) {
    setItems((prev) => prev.map((it, i) => {
      if (i !== idx) return it
      const has = it.slots.includes(slot)
      // Prevent enabling a past slot
      if (!has && isSlotPast(it.date, slot)) {
        toast.error('Khung giờ này đã qua. Không thể bật.')
        return it
      }
      return { ...it, slots: has ? it.slots.filter((s) => s !== slot) : [...it.slots, slot].sort() }
    }))
  }

  function removeDate(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function fmt(date: string) {
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
  }

  async function saveAll() {
    setBusy(true)
    try {
      const payload = { items: items.map((it) => ({ date: it.date, slots: it.slots })) }
      const res = await fetch('/api/reader/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error ?? 'Lưu lịch thất bại.'); return }
      toast.success('Đã lưu lịch trống.')
      router.refresh()
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Thêm ngày */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-3 text-purple-400">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium text-foreground">Thêm ngày trống</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <DatePicker value={newDate} onChange={setNewDate} placeholder="Chọn ngày" />
          </div>
          <Button type="button" onClick={addDate} className="bg-purple-600 hover:bg-purple-500 text-white shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Thêm
          </Button>
        </div>
      </GlassCard>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Chưa có ngày trống nào. Thêm ngày phía trên.</p>
      ) : (
        items.map((it, idx) => (
          <GlassCard key={it.date} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground capitalize">{fmt(it.date)}</span>
              <button type="button" onClick={() => removeDate(idx)}
                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                aria-label="Xóa ngày">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {TIME_SLOTS.map((slot) => {
                const active = it.slots.includes(slot)
                const disabled = isSlotPast(it.date, slot)
                return (
                  <button key={slot} type="button" onClick={() => toggleSlot(idx, slot)} disabled={disabled}
                    title={disabled ? 'Khung giờ này đã qua' : undefined}
                    className={cn(
                      'py-2 rounded-lg text-sm text-center transition-all border',
                      active
                        ? 'bg-purple-500/20 border-purple-500/50 text-foreground'
                        : disabled
                          ? 'opacity-50 cursor-not-allowed bg-white/3 border-white/5 text-muted-foreground'
                          : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30'
                    )}>
                    {slot}
                  </button>
                )
              })}
            </div>
            {it.slots.length === 0 && (
              <p className="text-xs text-amber-400/80 mt-2">Ngày chưa chọn giờ sẽ không được lưu.</p>
            )}
          </GlassCard>
        ))
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={saveAll} disabled={busy}
          className="bg-purple-600 hover:bg-purple-500 text-white">
          {busy ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu…</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Lưu lịch trống</>
          )}
        </Button>
      </div>
    </div>
  )
}
