'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatAmountK } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING',           label: 'Chờ xác nhận TT' },
  { value: 'PAYMENT_CONFIRMED', label: 'Đã nhận tiền' },
  { value: 'CONFIRMED',         label: 'Reader xác nhận' },
  { value: 'COMPLETED',         label: 'Hoàn thành' },
  { value: 'CANCELLED',         label: 'Đã hủy' },
]

const STATUS_STYLE: Record<string, string> = {
  COMPLETED:         'bg-green-500/20  text-green-400  border-green-500/30',
  CONFIRMED:         'bg-blue-500/20   text-blue-400   border-blue-500/30',
  PAYMENT_CONFIRMED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  PENDING:           'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  CANCELLED:         'bg-red-500/20    text-red-400    border-red-500/30',
}
const STATUS_LABEL: Record<string, string> = {
  COMPLETED:         'Hoàn thành',
  CONFIRMED:         'Reader XN',
  PAYMENT_CONFIRMED: 'Đã nhận tiền',
  PENDING:           'Chờ duyệt TT',
  CANCELLED:         'Đã hủy',
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), search, status, dateFrom, dateTo })
    const res = await fetch(`/api/admin/bookings?${p}`)
    const data = await res.json()
    setBookings(data.bookings ?? [])
    setTotal(data.total ?? 0)
    setTotalPages(data.totalPages ?? 1)
    setLoading(false)
  }, [page, search, status, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  async function updateBookingStatus(id: number, newStatus: string) {
    setBusyId(id)
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) { toast.success('Đã cập nhật trạng thái.'); load() }
    else toast.error('Cập nhật thất bại.')
    setBusyId(null)
    setEditId(null)
  }

  async function confirmPayment(id: number) {
    setBusyId(id)
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'payment_confirm' }),
    })
    if (res.ok) { toast.success('Đã xác nhận thanh toán. Reader sẽ thấy lịch này.'); load() }
    else { const d = await res.json(); toast.error(d.error ?? 'Thất bại.') }
    setBusyId(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Lịch hẹn</h1>
        <p className="text-sm text-muted-foreground">{total} lịch hẹn</p>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm khách hàng, reader..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 bg-white/5 border-white/10" />
          </div>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-background">{o.label}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground" />
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground" />
          <Button variant="ghost" size="sm" onClick={load} className="text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Khách hàng', 'Reader', 'Gói dịch vụ', 'Số tiền', 'Ngày hẹn', 'Giờ', 'Trạng thái', 'Đánh giá', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              ) : bookings.map((b, i) => (
                <tr key={b.id} className={cn('border-b border-white/5 hover:bg-white/3', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                  <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                  <td className="px-4 py-3 text-foreground">{b.customer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.reader.name}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {b.package?.name} · {b.package?.duration}p
                  </td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">
                    {b.package ? formatAmountK(b.package.price) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.time}</td>
                  <td className="px-4 py-3">
                    {editId === b.id ? (
                      <div className="flex items-center gap-1.5">
                        <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                          className="px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-foreground">
                          {STATUS_OPTIONS.filter(o => o.value).map(o => (
                            <option key={o.value} value={o.value} className="bg-background">{o.label}</option>
                          ))}
                        </select>                        <Button size="sm" disabled={busyId === b.id}
                          onClick={() => updateBookingStatus(b.id, editStatus)}
                          className="h-6 px-2 text-xs bg-purple-600 text-white">Lưu</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}
                          className="h-6 px-2 text-xs">Hủy</Button>
                      </div>
                    ) : (
                      <span className={cn('px-2 py-0.5 rounded-full text-xs border', STATUS_STYLE[b.status] ?? '')}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.review ? (
                      <span className="text-yellow-400 text-xs">⭐ {b.review.rating}</span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {editId !== b.id && (
                      <div className="flex items-center gap-2">
                        {b.status === 'PENDING' && (
                          <button
                            disabled={busyId === b.id}
                            onClick={() => confirmPayment(b.id)}
                            className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 transition-colors whitespace-nowrap disabled:opacity-50"
                          >
                            {busyId === b.id ? '...' : '✓ Duyệt TT'}
                          </button>
                        )}
                        <button onClick={() => { setEditId(b.id); setEditStatus(b.status) }}
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                          Sửa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-muted-foreground">Trang {page}/{totalPages} · {total} lịch hẹn</span>
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
