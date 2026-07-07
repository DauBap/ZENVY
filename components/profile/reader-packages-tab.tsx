'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, Trash2, Plus, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NumberInput } from '@/components/ui/number-input'
import { cn } from '@/lib/utils'

export interface PackageItem {
  id: number | null // null = chưa lưu (gói mới)
  name: string
  duration: number
  price: number
  description: string
  popular: boolean
}

function emptyPackage(): PackageItem {
  return { id: null, name: '', duration: 30, price: 0, description: '', popular: false }
}

export function ReaderPackagesTab({ initial }: { initial: PackageItem[] }) {
  const router = useRouter()
  const [items, setItems] = useState<PackageItem[]>(initial)
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const update = (idx: number, patch: Partial<PackageItem>) => {
    setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  }

  async function save(idx: number) {
    const pkg = items[idx]
    if (!pkg.name.trim()) { toast.error('Vui lòng nhập tên gói.'); return }
    if (pkg.duration <= 0) { toast.error('Thời lượng phải lớn hơn 0.'); return }
    // price = 0 hợp lệ (miễn phí)

    const key = `save-${idx}`
    setBusyKey(key)
    try {
      const isNew = pkg.id === null
      const url = isNew ? '/api/reader/packages' : `/api/reader/packages/${pkg.id}`
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pkg.name.trim(),
          duration: pkg.duration,
          price: pkg.price,
          description: pkg.description,
          popular: pkg.popular,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error ?? 'Lưu gói thất bại.'); return }
      toast.success(isNew ? 'Đã thêm gói.' : 'Đã lưu gói.')
      router.refresh()
      // Gán id thật cho gói vừa tạo để các lần lưu sau là PATCH
      if (isNew && data.package?.id) update(idx, { id: data.package.id })
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setBusyKey(null)
    }
  }

  async function remove(idx: number) {
    const pkg = items[idx]
    // Gói chưa lưu → chỉ bỏ khỏi danh sách
    if (pkg.id === null) {
      setItems((prev) => prev.filter((_, i) => i !== idx))
      return
    }
    const key = `del-${idx}`
    setBusyKey(key)
    try {
      const res = await fetch(`/api/reader/packages/${pkg.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { toast.error(data.error ?? 'Xóa gói thất bại.'); return }
      toast.success('Đã xóa gói.')
      setItems((prev) => prev.filter((_, i) => i !== idx))
      router.refresh()
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Chưa có gói dịch vụ nào. Thêm gói đầu tiên bên dưới.</p>
      )}

      {items.map((pkg, idx) => (
        <GlassCard key={pkg.id ?? `new-${idx}`} className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#768064]">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium text-foreground">
                {pkg.id === null ? 'Gói mới' : pkg.name || 'Gói dịch vụ'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => remove(idx)}
              disabled={busyKey === `del-${idx}`}
              className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              aria-label="Xóa gói"
            >
              {busyKey === `del-${idx}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2">
            <Label>Tên gói</Label>
            <Input value={pkg.name} onChange={(e) => update(idx, { name: e.target.value })}
              placeholder="VD: Oracle Reading" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Thời lượng (phút)</Label>
              <NumberInput min={1} value={pkg.duration}
                onChange={(v) => update(idx, { duration: Number(v) })} />
            </div>
            <div className="space-y-2">
              <Label>Giá (k) — nhập 100 = 100,000đ</Label>
              <NumberInput
                min={0}
                step={1}
                value={pkg.price / 1000}
                onChange={(v) => update(idx, { price: Math.round(Number(v) * 1000) })}
              />
              {pkg.price > 0 && (
                <p className="text-xs text-muted-foreground">
                  = {pkg.price.toLocaleString('vi-VN')}đ
                </p>
              )}
              {pkg.price === 0 && (
                <p className="text-xs text-green-400">Miễn phí</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea value={pkg.description} onChange={(e) => update(idx, { description: e.target.value })}
              placeholder="Mô tả ngắn về gói dịch vụ…" rows={2} maxLength={500} />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={pkg.popular}
                onChange={(e) => update(idx, { popular: e.target.checked })}
                className="w-4 h-4 rounded accent-[#A5B38B]" />
              <span className="text-sm text-muted-foreground">Đánh dấu &quot;Phổ biến&quot;</span>
            </label>
            <Button type="button" size="sm" disabled={busyKey === `save-${idx}`}
              onClick={() => save(idx)}
              className="bg-[#4C583E] hover:bg-[#768064] text-white">
              {busyKey === `save-${idx}` ? (
                <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang lưu…</>
              ) : (pkg.id === null ? 'Thêm gói' : 'Lưu')}
            </Button>
          </div>
        </GlassCard>
      ))}

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, emptyPackage()])}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed transition-all',
          'border-white/15 text-muted-foreground hover:border-[#768064]/40 hover:text-[#4C583E] hover:bg-[#768064]/5'
        )}
      >
        <Plus className="w-4 h-4" /> Thêm gói dịch vụ
      </button>
    </div>
  )
}
