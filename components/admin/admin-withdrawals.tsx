'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, RefreshCw, CheckCircle, XCircle, Clock, Settings2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const STATUS_OPTS = [
  { value: '',         label: 'Tất cả' },
  { value: 'PENDING',  label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
]
const STATUS_STYLE: Record<string, string> = {
  PENDING:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20  text-green-400  border-green-500/30',
  REJECTED: 'bg-red-500/20    text-red-400    border-red-500/30',
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt', REJECTED: 'Từ chối',
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M₫` : `${n.toLocaleString('vi-VN')}₫`

export function AdminWithdrawalsPage() {
  const [data, setData] = useState<any>(null)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [noteMap, setNoteMap] = useState<Record<number, string>>({})

  // Commission rate editor
  const [commissionRate, setCommissionRate] = useState(10)
  const [editRate, setEditRate] = useState('')
  const [savingRate, setSavingRate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/withdrawals?status=${status}&page=${page}`)
      const d = await res.json()
      setData(d)
      setCommissionRate(d.commissionRate ?? 10)
      setEditRate(String(d.commissionRate ?? 10))
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { load() }, [load])

  async function handleAction(id: number, action: 'approve' | 'reject') {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote: noteMap[id] ?? '' }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? 'Thao tác thất bại.'); return }
      toast.success(action === 'approve' ? 'Đã duyệt — đã trừ balance Reader.' : 'Đã từ chối.')
      load()
    } finally {
      setBusyId(null)
    }
  }

  async function saveCommissionRate() {
    const rate = Number(editRate)
    if (isNaN(rate) || rate < 0 || rate > 100) { toast.error('Tỷ lệ phải từ 0 đến 100.'); return }
    setSavingRate(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionRate: rate }),
      })
      if (res.ok) { toast.success(`Đã cập nhật hoa hồng thành ${rate}%.`); setCommissionRate(rate) }
      else toast.error('Lưu thất bại.')
    } finally {
      setSavingRate(false)
    }
  }

  const items: any[] = data?.withdrawals ?? []
  const totalPages: number = data?.totalPages ?? 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giải ngân & Giao dịch</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} yêu cầu</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Commission rate editor */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Settings2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-sm font-medium text-foreground">Hoa hồng hệ thống hiện tại:</span>
          <span className="text-lg font-bold text-purple-400">{commissionRate}%</span>
          <div className="flex items-center gap-2 ml-auto">
            <Input
              value={editRate}
              onChange={e => setEditRate(e.target.value)}
              className="w-24 bg-white/5 border-white/10 text-center"
              placeholder="VD: 10"
              type="number"
              min={0}
              max={100}
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button size="sm" onClick={saveCommissionRate} disabled={savingRate}
              className="bg-purple-600 hover:bg-purple-500 text-white">
              {savingRate ? 'Đang lưu…' : 'Cập nhật'}
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Filter */}
      <GlassCard className="p-4">
        <div className="flex gap-3 flex-wrap">
          {STATUS_OPTS.map(o => (
            <button key={o.value}
              onClick={() => { setStatus(o.value); setPage(1) }}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm border transition-all',
                status === o.value
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30'
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Reader', 'ATM', 'Số tiền yêu cầu', 'Hoa hồng', 'Thực trả', 'Trạng thái', 'Ngày', 'Ghi chú / Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">Không có yêu cầu nào.</td></tr>
              ) : items.map((w, i) => (
                <tr key={w.id} className={cn('border-b border-white/5 hover:bg-white/3', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                  <td className="px-4 py-3 text-muted-foreground">#{w.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{w.readerName}</div>
                    <div className="text-xs text-muted-foreground">{w.readerEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-foreground">{w.bankName}</div>
                    <div className="text-xs text-muted-foreground">{w.bankAccount} · {w.bankOwnerName}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">{fmt(w.amountRequested)}</td>
                  <td className="px-4 py-3 text-red-400">−{w.commissionRate}%</td>
                  <td className="px-4 py-3 font-bold text-green-400">{fmt(w.amountToPay)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs border', STATUS_STYLE[w.status] ?? '')}>
                      {w.status === 'PENDING' && <Clock className="w-3 h-3" />}
                      {w.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                      {w.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {STATUS_LABEL[w.status] ?? w.status}
                    </span>
                    {w.adminNote && <div className="text-xs text-amber-400 mt-1 max-w-[120px] truncate">{w.adminNote}</div>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    {w.status === 'PENDING' ? (
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        <Input
                          value={noteMap[w.id] ?? ''}
                          onChange={e => setNoteMap(prev => ({ ...prev, [w.id]: e.target.value }))}
                          placeholder="Ghi chú (tuỳ chọn)"
                          className="h-7 text-xs bg-white/5 border-white/10"
                        />
                        <div className="flex gap-1.5">
                          <Button size="sm" disabled={busyId === w.id}
                            onClick={() => handleAction(w.id, 'approve')}
                            className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-500 text-white">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {busyId === w.id ? '…' : 'Duyệt'}
                          </Button>
                          <Button size="sm" variant="destructive" disabled={busyId === w.id}
                            onClick={() => handleAction(w.id, 'reject')}
                            className="flex-1 h-7 text-xs">
                            <XCircle className="w-3 h-3 mr-1" />
                            {busyId === w.id ? '…' : 'Từ chối'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-muted-foreground">Trang {page}/{totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/10 h-8 w-8 p-0"
                disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-white/10 h-8 w-8 p-0"
                disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
