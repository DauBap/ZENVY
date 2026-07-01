'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Search, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Star } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, formatAmountK } from '@/lib/utils'

export function AdminPaymentsPage() {
  const [data, setData] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), search, dateFrom, dateTo })
    const res = await fetch(`/api/admin/payments?${p}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }, [page, search, dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  async function exportCSV() {
    setExporting(true)
    const p = new URLSearchParams({ dateFrom, dateTo })
    const res = await fetch(`/api/admin/payments/export?${p}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const totalRevenue = data?.totalRevenue ?? 0
  const earnings: any[] = data?.earnings ?? []
  const topReaders: any[] = data?.topReaders ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thanh toán</h1>
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} giao dịch</p>
        </div>
        <Button onClick={exportCSV} disabled={exporting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Đang xuất...' : 'Xuất CSV'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Tổng doanh thu', value: `${(totalRevenue / 1_000_000).toFixed(2)}k`, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Giao dịch', value: (data?.total ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Reader nổi bật', value: topReaders[0]?.name ?? '—', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map(c => (
          <GlassCard key={c.label} className="p-4 flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', c.bg)}>
              <c.icon className={cn('w-5 h-5', c.color)} />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">{c.value}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Top earners */}
      {topReaders.length > 0 && (
        <GlassCard className="p-5">
          <h3 className="font-semibold text-foreground mb-4">Top Reader thu nhập cao</h3>
          <div className="space-y-2">
            {topReaders.map((r, i) => (
              <div key={r.readerId} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-5">{i + 1}</span>
                {r.avatar ? (
                  <div className="w-7 h-7 rounded-full shrink-0" style={{ backgroundImage: `url("${r.avatar}")`, backgroundSize: 'cover' }} />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-300 shrink-0">
                    {r.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm text-foreground flex-1">{r.name}</span>
                <span className="text-sm text-muted-foreground">{r.sessionCount} phiên</span>
                <span className="text-sm font-semibold text-green-400">{(Number(r.totalEarnings) / 1_000_000).toFixed(2)}k</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm reader..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 bg-white/5 border-white/10" />
          </div>
          <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground" />
          <span className="flex items-center text-muted-foreground text-sm">→</span>
          <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground" />
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Booking', 'Reader', 'Khách hàng', 'Gói dịch vụ', 'Số tiền', 'Ngày'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : earnings.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Không có giao dịch</td></tr>
              ) : earnings.map((e, i) => (
                <tr key={e.id} className={cn('border-b border-white/5 hover:bg-white/3', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                  <td className="px-4 py-3 text-muted-foreground">#{e.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">#{e.bookingId}</td>
                  <td className="px-4 py-3 text-foreground">{e.reader.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{e.customer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {e.package?.name} · {e.package?.duration}p
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-400">
                    {formatAmountK(Number(e.amount))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-muted-foreground">Trang {page}/{data?.totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-white/10 h-8 w-8 p-0"
                disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-white/10 h-8 w-8 p-0"
                disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
