'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, RefreshCw, Ticket, X, Calendar, Power } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { formatAmountK } from '@/lib/utils'

interface Coupon {
  id: number
  code: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: number
  max_uses: number | null
  times_used: number
  start_date: string | null
  end_date: string | null
  active: boolean
  created_at: string
}

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  // Form state
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [active, setActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (res.ok) setCoupons(data.coupons ?? [])
      else toast.error(data.error ?? 'Không tải được danh sách.')
    } catch {
      toast.error('Không tải được danh sách.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCoupons() }, [loadCoupons])

  function openCreateDialog() {
    setEditingCoupon(null)
    setCode(''); setDiscountType('PERCENTAGE'); setDiscountValue('')
    setMaxUses(''); setStartDate(''); setEndDate(''); setActive(true)
    setDialogOpen(true)
  }

  function openEditDialog(coupon: Coupon) {
    setEditingCoupon(coupon)
    setCode(coupon.code)
    setDiscountType(coupon.discount_type)
    setDiscountValue(String(coupon.discount_value / 1000))
    setMaxUses(coupon.max_uses !== null ? String(coupon.max_uses) : '')
    setStartDate(coupon.start_date ? coupon.start_date.substring(0, 10) : '')
    setEndDate(coupon.end_date ? coupon.end_date.substring(0, 10) : '')
    setActive(coupon.active)
    setDialogOpen(true)
  }

  async function handleToggleActive(coupon: Coupon) {
    setBusyId(coupon.id)
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !coupon.active }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Thao tác thất bại.'); return }
      toast.success(coupon.active ? 'Đã tắt mã.' : 'Đã kích hoạt mã.')
      loadCoupons()
    } catch { toast.error('Có lỗi xảy ra.') }
    finally { setBusyId(null) }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Xóa mã "${coupon.code}"?`)) return
    setBusyId(coupon.id)
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Xóa thất bại.'); return }
      toast.success('Đã xóa mã.')
      loadCoupons()
    } catch { toast.error('Có lỗi xảy ra.') }
    finally { setBusyId(null) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedCode = code.trim().toUpperCase()
    if (!trimmedCode) { toast.error('Vui lòng nhập mã.'); return }
    const val = Number(discountValue)
    if (isNaN(val) || val <= 0) { toast.error('Giá trị giảm phải > 0.'); return }
    if (discountType === 'PERCENTAGE' && val > 100) { toast.error('% không được > 100.'); return }

    setSubmitting(true)
    // FIXED: nhập theo đơn vị nghìn đồng (k), lưu DB theo đồng → nhân 1000
    const storedValue = discountType === 'FIXED' ? Math.floor(val * 1000) : val
    const payload = {
      code: trimmedCode, discount_type: discountType, discount_value: storedValue,
      max_uses: maxUses.trim() ? Number(maxUses) : null,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      active,
    }
    try {
      const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons'
      const res = await fetch(url, { method: editingCoupon ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Lưu thất bại.'); return }
      toast.success(editingCoupon ? 'Đã cập nhật.' : 'Đã tạo mã mới.')
      setDialogOpen(false)
      loadCoupons()
    } catch { toast.error('Có lỗi xảy ra.') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý mã giảm giá</h1>
          <p className="text-sm text-muted-foreground">{coupons.length} mã trong hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadCoupons} className="text-muted-foreground">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openCreateDialog} className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
            <Plus className="w-4 h-4 mr-1.5" /> Tạo mã mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải…</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chưa có mã giảm giá nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-muted-foreground font-medium">
                  <th className="p-4">Mã</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Giá trị</th>
                  <th className="p-4">Lượt dùng</th>
                  <th className="p-4">Hiệu lực</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#768064]" />
                        {coupon.code}
                      </div>
                    </td>
                    <td className="p-4">
                      {coupon.discount_type === 'PERCENTAGE'
                        ? <span className="px-2 py-1 rounded bg-[#768064]/20 text-[#768064] text-xs font-semibold">% Phần trăm</span>
                        : <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-semibold">Cố định</span>}
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : formatAmountK(coupon.discount_value)}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      <span className="text-foreground font-medium">{coupon.times_used}</span> / {coupon.max_uses ?? '∞'}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString('vi-VN') : 'Từ đầu'}
                        {' – '}
                        {coupon.end_date ? new Date(coupon.end_date).toLocaleDateString('vi-VN') : 'Không hạn'}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        disabled={busyId === coupon.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          coupon.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        {coupon.active ? 'Kích hoạt' : 'Tắt'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(coupon)} disabled={busyId === coupon.id} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon)} disabled={busyId === coupon.id} className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#2a2f26] border border-[#4a5040] rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-[#323829] border-b border-[#4a5040]">
              <div className="flex items-center gap-2.5">
                <Ticket className="w-5 h-5 text-[#a5b38b]" />
                <h2 className="text-base font-bold text-white">
                  {editingCoupon ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
                </h2>
              </div>
              <button onClick={() => setDialogOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#a5b38b] hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                {/* Mã */}
                <div>
                  <label className="block text-sm font-semibold text-[#c8d5b5] mb-1.5">
                    Mã khuyến mãi <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: SUMMER2025"
                    disabled={editingCoupon !== null}
                    className="w-full h-10 px-3.5 rounded-lg bg-[#1e2219] border border-[#4a5040] text-white placeholder:text-[#5a6a4a] font-mono tracking-widest text-sm focus:outline-none focus:border-[#768064] disabled:opacity-50 transition-colors"
                  />
                  <p className="text-xs text-[#6b7a5a] mt-1">Chữ in hoa, không dấu cách</p>
                </div>

                {/* Loại giảm */}
                <div>
                  <label className="block text-sm font-semibold text-[#c8d5b5] mb-1.5">
                    Loại giảm giá <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-1 p-1 bg-[#1e2219] border border-[#4a5040] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENTAGE')}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                        discountType === 'PERCENTAGE' ? 'bg-[#768064] text-white shadow-sm' : 'text-[#8a9a6a] hover:text-white'
                      }`}
                    >
                      % Phần trăm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('FIXED')}
                      className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                        discountType === 'FIXED' ? 'bg-[#768064] text-white shadow-sm' : 'text-[#8a9a6a] hover:text-white'
                      }`}
                    >
                      Cố định
                    </button>
                  </div>
                </div>

                {/* Giá trị */}
                <div>
                  <label className="block text-sm font-semibold text-[#c8d5b5] mb-1.5">
                    Giá trị giảm <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#768064]">
                      {discountType === 'PERCENTAGE' ? '%' : 'k'}
                    </span>
                    <input
                      required
                      type="number"
                      min={1}
                      max={discountType === 'PERCENTAGE' ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === 'PERCENTAGE' ? '10' : '100'}
                      className="w-full h-10 pl-8 pr-3.5 rounded-lg bg-[#1e2219] border border-[#4a5040] text-white placeholder:text-[#5a6a4a] text-sm focus:outline-none focus:border-[#768064] transition-colors"
                    />
                  </div>
                  {discountValue && Number(discountValue) > 0 && (
                    <p className="text-xs text-[#a5b38b] mt-1 font-medium">
                      {discountType === 'PERCENTAGE'
                        ? `→ Giảm ${discountValue}% trên tổng đơn`
                        : `→ Giảm cố định ${formatAmountK(Number(discountValue) * 1000)}`}
                    </p>
                  )}
                </div>

                {/* Lượt dùng */}
                <div>
                  <label className="block text-sm font-semibold text-[#c8d5b5] mb-1.5">Số lượt dùng tối đa</label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Để trống = Không giới hạn"
                    className="w-full h-10 px-3.5 rounded-lg bg-[#1e2219] border border-[#4a5040] text-white placeholder:text-[#5a6a4a] text-sm focus:outline-none focus:border-[#768064] transition-colors"
                  />
                </div>

                {/* Thời hạn */}
                <div>
                  <label className="block text-sm font-semibold text-[#c8d5b5] mb-1.5">Thời hạn hiệu lực</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#8a9a6a] mb-1">Từ ngày</p>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#1e2219] border border-[#4a5040] text-white text-sm focus:outline-none focus:border-[#768064] transition-colors [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-[#8a9a6a] mb-1">Đến ngày</p>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-[#1e2219] border border-[#4a5040] text-white text-sm focus:outline-none focus:border-[#768064] transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#6b7a5a] mt-1">Để trống = Không giới hạn thời gian</p>
                </div>

                {/* Kích hoạt */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#1e2219] border border-[#4a5040]">
                  <div>
                    <p className="text-sm font-semibold text-white">Kích hoạt ngay</p>
                    <p className="text-xs text-[#8a9a6a] mt-0.5">Mã dùng được ngay sau khi tạo</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActive(v => !v)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${active ? 'bg-[#768064]' : 'bg-[#3a3f36]'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 px-5 py-4 bg-[#232820] border-t border-[#4a5040]">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#a5b38b] hover:text-white border border-[#4a5040] hover:border-[#768064] transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#768064] hover:bg-[#8a9470] text-white transition-all disabled:opacity-60 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Đang lưu…
                    </>
                  ) : editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}
