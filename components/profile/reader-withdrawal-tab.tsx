'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { Loader2, Banknote, Building2, CreditCard, ArrowDownToLine, Clock, CheckCircle, XCircle, Trash2, UploadCloud } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { resizeImage } from '@/lib/image'

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  PENDING:  { label: 'Đang chờ', icon: <Clock className="w-3.5 h-3.5" />,       cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  APPROVED: { label: 'Đã duyệt', icon: <CheckCircle className="w-3.5 h-3.5" />, cls: 'bg-green-500/20  text-green-400  border-green-500/30'  },
  REJECTED: { label: 'Từ chối',  icon: <XCircle className="w-3.5 h-3.5" />,     cls: 'bg-red-500/20    text-red-400    border-red-500/30'    },
}

const fmt = (n: number) => {
  if (!Number.isFinite(n) || n === 0) return '0k'
  const k = n / 1000
  if (k >= 1000) return `${(k / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}M`
  return `${Number.isInteger(k) ? k.toLocaleString('vi-VN') : k.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}k`
}

const parseAmt = (raw: string) => {
  const v = Number(raw.trim().replace(/\D/g, ''))
  if (!v) return 0
  return v <= 1000 ? v * 1000 : v
}

export function ReaderWithdrawalTab() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Bank form
  const [bankName, setBankName] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [bankOwnerName, setBankOwnerName] = useState('')
  const [bankQrCode, setBankQrCode] = useState<string | null>(null)
  const [savingBank, setSavingBank] = useState(false)
  const [processingQr, setProcessingQr] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)

  // Withdrawal form
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commissionRate, setCommissionRate] = useState(10)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [wRes, settingRes] = await Promise.all([
        fetch('/api/reader/withdrawals'),
        fetch('/api/admin/settings').catch(() => null),
      ])
      if (wRes.ok) {
        const d = await wRes.json()
        setData(d)
        setBankName(d.bankName ?? '')
        setBankAccount(d.bankAccount ?? '')
        setBankOwnerName(d.bankOwnerName ?? '')
        setBankQrCode(d.bankQrCode ?? null)
      }
      if (settingRes?.ok) {
        const s = await settingRes.json()
        setCommissionRate(s.commissionRate ?? 10)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh QR.')
      return
    }
    setProcessingQr(true)
    try {
      const resizedDataUrl = await resizeImage(file, 1024)
      const blob = await fetch(resizedDataUrl).then((res) => res.blob())
      const formData = new FormData()
      formData.append('qr', new File([blob], file.name, { type: blob.type }))

      const res = await fetch('/api/reader/bank/qr', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error ?? 'Upload QR thất bại.')
        return
      }
      setBankQrCode(data?.bankQrCode ?? resizedDataUrl)
      toast.success('Đã cập nhật mã QR ngân hàng.')
    } catch (err) {
      console.error('handleQrFile', err)
      toast.error('Không thể upload QR. Vui lòng thử lại.')
    } finally {
      setProcessingQr(false)
      if (qrInputRef.current) qrInputRef.current.value = ''
    }
  }

  async function saveBank() {
    if (!bankName.trim() || !bankAccount.trim() || !bankOwnerName.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng.')
      return
    }
    setSavingBank(true)
    try {
      const res = await fetch('/api/reader/bank', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, bankAccount, bankOwnerName }),
      })
      if (res.ok) {
        toast.success('Đã lưu thông tin ngân hàng.')
      } else {
        const d = await res.json().catch(() => null)
        toast.error(d?.error ?? 'Lưu thất bại.')
      }
    } finally {
      setSavingBank(false)
    }
  }

  async function removeBankQr() {
    if (!bankQrCode) return
    setProcessingQr(true)
    try {
      const res = await fetch('/api/reader/bank/qr', { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error ?? 'Xóa QR thất bại.')
        return
      }
      setBankQrCode(null)
      toast.success('Đã xóa mã QR.')
    } catch (err) {
      console.error('removeBankQr', err)
      toast.error('Không thể xóa QR. Vui lòng thử lại.')
    } finally {
      setProcessingQr(false)
    }
  }

  async function requestWithdrawal() {
    const amt = parseAmt(amount)
    if (!amt || amt < 100000) { toast.error('Số tiền tối thiểu 100k.'); return }
    const available = data?.availableBalance ?? 0
    if (amt > available) { toast.error(`Số dư khả dụng chỉ còn ${fmt(available)}.`); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reader/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt }),
      })
      const d = await res.json()
      if (!res.ok) { toast.error(d.error ?? 'Gửi yêu cầu thất bại.'); return }
      toast.success('Đã gửi yêu cầu rút tiền. Admin sẽ xử lý sớm!')
      setAmount('')
      load()
    } finally {
      setSubmitting(false)
    }
  }

  const requestedAmt = parseAmt(amount)
  const commission = Math.floor(requestedAmt * commissionRate / 100)
  const receivedAmt = requestedAmt - commission
  const availableBalance = data?.availableBalance ?? 0

  if (loading) return (
    <GlassCard className="p-8 flex justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
    </GlassCard>
  )

  return (
    <div className="space-y-5">
      {/* Balance overview */}
      <GlassCard className="p-5">
        <div className="text-sm text-muted-foreground mb-1">Tổng số dư</div>
        <div className="text-3xl font-bold gradient-text">{fmt(data?.balance ?? 0)}</div>
      </GlassCard>

      {/* Bank info */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          Thông tin ngân hàng ATM
        </h3>
        <p className="text-sm italic text-yellow-400/90 flex items-center gap-1.5">
          <span>⚠</span> Tên chủ tài khoản phải trùng với tên reader.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tên ngân hàng</Label>
            <Input value={bankName} onChange={e => setBankName(e.target.value)}
              placeholder="VD: Vietcombank, Techcombank…" />
          </div>
          <div className="space-y-1.5">
            <Label>Số tài khoản</Label>
            <Input value={bankAccount} onChange={e => setBankAccount(e.target.value)}
              placeholder="0123456789" />
          </div>
          <div className="space-y-1.5">
            <Label>Tên chủ tài khoản</Label>
            <Input value={bankOwnerName} onChange={e => setBankOwnerName(e.target.value)}
              placeholder="NGUYEN VAN A" />
          </div>
        </div>

        {/* QR section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Mã QR ngân hàng</Label>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={processingQr}
                onClick={() => qrInputRef.current?.click()}
                className="h-8 text-xs border-white/10">
                {processingQr ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Đang xử lý…</> : <><UploadCloud className="w-3.5 h-3.5 mr-1" />Upload</>}
              </Button>
              {bankQrCode && (
                <Button size="sm" variant="outline" disabled={processingQr} onClick={removeBankQr}
                  className="h-8 text-xs border-white/10">
                  <Trash2 className="w-3.5 h-3.5 mr-1" />Xóa
                </Button>
              )}
            </div>
          </div>
          <input ref={qrInputRef} type="file" accept="image/*" onChange={handleQrFile} className="hidden" />
          {bankQrCode ? (
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/10 max-w-[240px]">
              <img src={bankQrCode} alt="QR ngân hàng" className="w-full h-auto object-contain" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Upload mã QR để khách hàng quét nhanh khi chuyển khoản.</p>
          )}
        </div>

        <Button onClick={saveBank} disabled={savingBank} size="sm"
          className="bg-purple-600 hover:bg-purple-500 text-white">
          {savingBank ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang lưu…</> : 'Lưu thông tin'}
        </Button>
      </GlassCard>

      {/* Withdrawal form */}
      <GlassCard className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <ArrowDownToLine className="w-4 h-4 text-purple-400" />
          Yêu cầu rút tiền
        </h3>
        <div className="space-y-1.5">
          <Label>Số tiền muốn rút</Label>
          <Input value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="VD: 100 = 100k" inputMode="numeric" />
        </div>
        {requestedAmt > 0 && (
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền yêu cầu</span>
              <span className="font-medium text-foreground">{fmt(requestedAmt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí sàn ({commissionRate}%)</span>
              <span className="text-red-400">−{fmt(commission)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2">
              <span className="font-semibold text-foreground">Thực nhận về ATM</span>
              <span className="font-bold text-base text-green-400">{fmt(receivedAmt)}</span>
            </div>
          </div>
        )}
        <Button onClick={requestWithdrawal}
          disabled={submitting || requestedAmt < 100000 || requestedAmt > availableBalance}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-full">
          {submitting
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang gửi…</>
            : <><Banknote className="w-4 h-4 mr-2" />Gửi yêu cầu rút tiền</>}
        </Button>
        {requestedAmt > availableBalance && requestedAmt > 0 && (
          <p className="text-xs text-red-400 text-center">Số dư khả dụng chỉ còn {fmt(availableBalance)}</p>
        )}
      </GlassCard>

      {/* Withdrawal history */}
      <GlassCard className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-400" />
          Lịch sử rút tiền
        </h3>
        {(data?.withdrawals ?? []).length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">Chưa có yêu cầu rút tiền nào.</p>
        ) : (
          <div className="space-y-2">
            {(data?.withdrawals ?? []).map((w: any) => {
              const st = STATUS_MAP[w.status] ?? STATUS_MAP.PENDING
              return (
                <div key={w.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <div className="text-sm font-medium text-foreground">{fmt(w.amountRequested)}</div>
                    <div className="text-xs text-muted-foreground">
                      {w.bankName} · {w.bankAccount} · Phí sàn {w.commissionRate}%
                    </div>
                    {w.adminNote && <div className="text-xs text-amber-400 mt-0.5">Ghi chú: {w.adminNote}</div>}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border', st.cls)}>
                      {st.icon}{st.label}
                    </span>
                    <span className="text-xs text-green-400 font-medium">→ {fmt(w.amountToPay)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(w.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
