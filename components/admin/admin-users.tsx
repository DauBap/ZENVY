'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, Trash2, Eye } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn, formatAmountK } from '@/lib/utils'

const ROLE_OPTIONS = [{ value: '', label: 'Tất cả role' }, { value: 'CUSTOMER', label: 'Customer' }, { value: 'READER', label: 'Reader' }, { value: 'ADMIN', label: 'Admin' }]
const STATUS_OPTIONS = [{ value: '', label: 'Tất cả trạng thái' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'BANNED', label: 'Banned' }]

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'bg-green-500/20 text-green-400',
  INACTIVE: 'bg-yellow-500/20 text-yellow-400',
  BANNED:   'bg-red-500/20 text-red-400',
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [detailUser, setDetailUser] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search, role, status })
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setTotalPages(data.totalPages ?? 1)
    setLoading(false)
  }, [page, search, role, status])

  useEffect(() => { load() }, [load])

  async function updateStatus(userId: number, newStatus: string) {
    setBusyId(userId)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) { toast.success('Đã cập nhật trạng thái.'); load() }
    else toast.error('Cập nhật thất bại.')
    setBusyId(null)
  }

  async function loadDetail(userId: number) {
    setBusyId(userId)
    const res = await fetch(`/api/admin/users/${userId}`)
    if (res.ok) {
      const data = await res.json()
      setDetailUser(data)
      setDetailOpen(true)
    } else {
      toast.error('Không lấy được chi tiết user.')
    }
    setBusyId(null)
  }

  async function toggleVerify(userId: number, current: boolean) {
    setBusyId(userId)
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: !current }),
    })
    if (res.ok) { toast.success(!current ? 'Đã xác minh reader.' : 'Đã bỏ xác minh.'); load() }
    else toast.error('Thao tác thất bại.')
    setBusyId(null)
  }

  async function deleteUser(userId: number) {
    if (!confirm('Xóa user này? Hành động không thể hoàn tác.')) return
    setBusyId(userId)
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Đã xóa user.'); load() }
    else toast.error('Xóa thất bại.')
    setBusyId(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Người dùng</h1>
        <p className="text-sm text-muted-foreground">{total} users</p>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Tìm email, tên..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 bg-white/5 border-white/10" />
          </div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground">
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-background">{o.label}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-background">{o.label}</option>)}
          </select>
        </div>
      </GlassCard>

      <Dialog open={detailOpen} onOpenChange={(open) => !open && setDetailOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>Thông tin chi tiết của người dùng.</DialogDescription>
          </DialogHeader>

          {!detailUser ? (
            <div className="py-10 text-center text-muted-foreground">Đang tải chi tiết...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {detailUser.avatar ? (
                  <div className="w-16 h-16 rounded-full bg-cover bg-center" style={{ backgroundImage: `url('${detailUser.avatar}')` }} />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl text-muted-foreground">?</div>
                )}
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Tên</p>
                  <p className="text-sm text-foreground font-medium">{detailUser.name}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground font-medium">{detailUser.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Email</p>
                  <p className="text-sm text-foreground font-medium">{detailUser.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Role</p>
                  <p className="text-sm text-foreground font-medium">{detailUser.role}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Trạng thái</p>
                  <p className="text-sm text-foreground font-medium">{detailUser.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Ngày đăng ký</p>
                  <p className="text-sm text-foreground font-medium">{new Date(detailUser.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              {detailUser.readerInfo ? (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Tên hiển thị</p>
                      <p className="text-sm text-foreground font-medium">{detailUser.readerInfo.display_name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Số điện thoại</p>
                      <p className="text-sm text-foreground font-medium">{detailUser.phone ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Facebook</p>
                      <p className="text-sm text-foreground font-medium">{detailUser.readerInfo.facebook_link ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">Kinh nghiệm</p>
                      <p className="text-sm text-foreground font-medium">{detailUser.readerInfo.experience_year ?? 0} năm</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Chuyên môn</p>
                      <p className="text-sm text-foreground font-medium">{detailUser.readerInfo.specialty?.join(', ') || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase text-muted-foreground">Giá/phiên</p>
                      <p className="text-sm text-foreground font-medium">{detailUser.readerInfo.price_per_session ? formatAmountK(detailUser.readerInfo.price_per_session) : '—'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">Không có thông tin reader.</div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setDetailOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Tên', 'Email', 'Role', 'Trạng thái', 'Xác minh', 'Ngày tạo', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">Không có dữ liệu</td></tr>
              ) : users.map((u, i) => (
                <tr key={u.id} className={cn('border-b border-white/5 hover:bg-white/3 transition-colors', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                  <td className="px-4 py-3 text-muted-foreground">#{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <div className="w-7 h-7 rounded-full shrink-0" style={{ backgroundImage: `url("${u.avatar}")`, backgroundSize: 'cover' }} />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[#768064]/20 flex items-center justify-center text-xs text-[#4C583E] shrink-0">
                          {u.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-foreground font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                      u.role === 'ADMIN' ? 'bg-[#768064]/20 text-[#4C583E]' :
                      u.role === 'READER' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10 text-muted-foreground')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_STYLE[u.status] ?? '')}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {u.role === 'READER' && (
                      u.verified
                        ? <span className="text-green-400 text-xs">✓ Xác minh</span>
                        : <span className="text-muted-foreground text-xs">Chưa</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Toggle active/banned */}
                      {u.status === 'ACTIVE' ? (
                        <button title="Khóa tài khoản" disabled={busyId === u.id}
                          onClick={() => updateStatus(u.id, 'BANNED')}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      ) : (
                        <button title="Kích hoạt" disabled={busyId === u.id}
                          onClick={() => updateStatus(u.id, 'ACTIVE')}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      {/* Toggle verify reader */}
                      {u.role === 'READER' && (
                        <button title={u.verified ? 'Bỏ xác minh' : 'Xác minh reader'}
                          disabled={busyId === u.id}
                          onClick={() => toggleVerify(u.id, u.verified)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button title="Xóa user" disabled={busyId === u.id}
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <span className="text-xs text-muted-foreground">Trang {page}/{totalPages} · {total} users</span>
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
