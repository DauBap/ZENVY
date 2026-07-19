'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Eye, Check, Trash2, RefreshCw, ExternalLink } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { cn } from '@/lib/utils'

export function AdminReadersPage() {
  const [readers, setReaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [detail, setDetail] = useState<any | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
  const [confirmUserId, setConfirmUserId] = useState<number | null>(null)
  const [confirmReason, setConfirmReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users?pending=true')
    const data = await res.json()
    setReaders(data.users ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function loadDetail(userId: number) {
    setBusyId(userId)
    const res = await fetch(`/api/admin/users/${userId}`)
    if (res.ok) {
      setDetail(await res.json())
      setDetailOpen(true)
    } else toast.error('Không lấy được chi tiết.')
    setBusyId(null)
  }

  async function approveReader(userId: number) {
    setConfirmAction('approve')
    setConfirmUserId(userId)
    setConfirmReason('')
    setConfirmOpen(true)
  }

  async function rejectReader(userId: number) {
    setConfirmAction('reject')
    setConfirmUserId(userId)
    setConfirmReason('')
    setConfirmOpen(true)
  }

  async function confirmExecute() {
    if (!confirmUserId || !confirmAction) return
    setBusyId(confirmUserId)
    try {
      if (confirmAction === 'approve') {
        const res = await fetch(`/api/admin/users/${confirmUserId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approve: true, reason: confirmReason }),
        })
        if (res.ok) {
          toast.success('Đã kích hoạt Reader. Vui lòng xác minh thủ công khi cần.')
          setDetailOpen(false)
          load()
        } else toast.error('Kích hoạt thất bại.')
      } else if (confirmAction === 'reject') {
        const res = await fetch(`/api/admin/users/${confirmUserId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: confirmReason }),
        })
        if (res.ok) {
          toast.success('Đã từ chối.')
          setDetailOpen(false)
          load()
        } else toast.error('Thao tác thất bại.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Thao tác thất bại.')
    } finally {
      setBusyId(null)
      setConfirmOpen(false)
      setConfirmReason('')
      setConfirmAction(null)
      setConfirmUserId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Duyệt Reader</h1>
          <p className="text-sm text-muted-foreground">
            {readers.length} reader đang chờ duyệt
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="text-muted-foreground">
          <RefreshCw className="w-4 h-4 mr-1" /> Làm mới
        </Button>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Tên', 'Email', 'Trạng thái', 'Ngày apply', 'Hành động'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Đang tải...</td></tr>
              ) : readers.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  Không có reader nào đang chờ duyệt 🎉
                </td></tr>
              ) : readers.map((u, i) => (
                <tr key={u.id} className={cn('border-b border-white/5 hover:bg-white/3', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                  <td className="px-4 py-3 text-muted-foreground">#{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {u.avatar ? (
                        <ImageLightbox src={u.avatar} alt={u.name || 'Avatar'}>
                          <div className="w-8 h-8 rounded-full shrink-0 bg-cover bg-center hover:ring-2 hover:ring-[#A5B38B]/60 transition-all cursor-pointer"
                            style={{ backgroundImage: `url("${u.avatar}")` }} />
                        </ImageLightbox>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#768064]/20 flex items-center justify-center text-xs text-[#4C583E] shrink-0">
                          {u.name?.charAt(0) ?? '?'}
                        </div>
                      )}
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-medium border border-yellow-500/30">
                      Chờ duyệt
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Xem chi tiết" disabled={busyId === u.id}
                        onClick={() => loadDetail(u.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button title="Duyệt" disabled={busyId === u.id}
                        onClick={() => approveReader(u.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-green-400 hover:bg-green-500/10 transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                      <button title="Từ chối & xóa" disabled={busyId === u.id}
                        onClick={() => rejectReader(u.id)}
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
      </GlassCard>

      {/* Detail modal */}
      <Dialog open={detailOpen} onOpenChange={o => !o && setDetailOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Hồ sơ Reader</DialogTitle>
            <DialogDescription>Xem xét thông tin trước khi duyệt</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {detail.readerInfo?.avatar_url ? (
                  <ImageLightbox src={detail.readerInfo.avatar_url} alt={detail.readerInfo?.display_name || 'Avatar'}>
                    <div className="w-16 h-16 rounded-2xl shrink-0 bg-cover bg-center hover:ring-2 hover:ring-[#A5B38B]/60 transition-all cursor-pointer"
                      style={{ backgroundImage: `url("${detail.readerInfo.avatar_url}")` }} />
                  </ImageLightbox>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#768064]/20 flex items-center justify-center text-2xl text-[#4C583E]">
                    {detail.readerInfo?.display_name?.charAt(0) ?? '?'}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground text-lg">{detail.readerInfo?.display_name}</p>
                  {detail.readerInfo?.real_name && detail.readerInfo.real_name !== detail.readerInfo.display_name && (
                    <p className="text-sm text-muted-foreground">Tên thật: {detail.readerInfo.real_name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{detail.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['SĐT', 'Coming soon'],
                  ['Kinh nghiệm', `${detail.readerInfo?.experience_year ?? 0} năm`],
                  ['Chuyên môn', (detail.readerInfo?.specialty ?? []).join(', ') || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                    <div className="text-foreground font-medium truncate">{value}</div>
                  </div>
                ))}
              </div>

              {detail.readerInfo?.description && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Mô tả</div>
                  <p className="text-sm text-foreground leading-relaxed line-clamp-4">{detail.readerInfo.description}</p>
                </div>
              )}

              {detail.readerInfo?.facebook_link && (
                <a href={detail.readerInfo.facebook_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                  <ExternalLink className="w-4 h-4" /> Facebook
                </a>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={() => approveReader(detail.id)} disabled={busyId === detail.id}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white">
                  <Check className="w-4 h-4 mr-2" />
                  {busyId === detail.id ? 'Đang xử lý...' : 'Kích hoạt tài khoản'}
                </Button>
                <Button onClick={() => rejectReader(detail.id)} disabled={busyId === detail.id}
                  variant="destructive" className="flex-1">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={o => !o && setConfirmOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{confirmAction === 'approve' ? 'Xác nhận duyệt Reader' : 'Xác nhận từ chối'}</DialogTitle>
            <DialogDescription>{confirmAction === 'approve' ? 'Bạn có chắc muốn kích hoạt reader này?' : 'Bạn có chắc muốn từ chối hồ sơ này? Ghi rõ lý do sẽ được gửi tới người dùng.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {confirmAction === 'reject' && (
              <label className="block text-sm">Lý do từ chối
                <Textarea value={confirmReason} onChange={(e) => setConfirmReason(e.target.value)} className="mt-2" rows={4} />
              </label>
            )}
            <div className="flex gap-3 pt-2">
              <Button onClick={confirmExecute} className="flex-1 bg-green-600 hover:bg-green-500 text-white">
                {confirmAction === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </Button>
              <Button variant="destructive" onClick={() => setConfirmOpen(false)} className="flex-1">Huỷ</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
