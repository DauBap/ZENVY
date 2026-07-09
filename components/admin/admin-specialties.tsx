'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, RefreshCw, Tag, Check, X } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AdminSpecialtiesPage() {
  const [items, setItems] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editName, setEditName] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [busyName, setBusyName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/specialties')
      const data = await res.json()
      setItems(data.specialties ?? [])
    } catch {
      toast.error('Không tải được danh sách chủ đề.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    try {
      const res = await fetch('/api/admin/specialties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Thêm thất bại.'); return }
      setItems(data.specialties)
      setNewName('')
      inputRef.current?.focus()
      toast.success(`Đã thêm "${name}".`)
    } finally {
      setAdding(false)
    }
  }

  async function handleEdit(oldName: string) {
    const name = editValue.trim()
    if (!name || name === oldName) { setEditName(null); return }
    setBusyName(oldName)
    try {
      const res = await fetch('/api/admin/specialties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: name }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Sửa thất bại.'); return }
      setItems(data.specialties)
      setEditName(null)
      toast.success('Đã cập nhật.')
    } finally {
      setBusyName(null)
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Xóa chủ đề "${name}"? Thao tác này không thể hoàn tác.`)) return
    setBusyName(name)
    try {
      const res = await fetch('/api/admin/specialties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Xóa thất bại.'); return }
      setItems(data.specialties)
      toast.success(`Đã xóa "${name}".`)
    } finally {
      setBusyName(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chủ đề</h1>
          <p className="text-sm text-muted-foreground">{items.length} chủ đề</p>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="text-muted-foreground">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Add new */}
      <GlassCard className="p-5">
        <p className="text-sm font-medium text-foreground mb-3">Thêm chủ đề mới</p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Tên chủ đề..."
            className="bg-white/5 border-white/10 focus:border-[#768064]/50"
          />
          <Button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm
          </Button>
        </div>
      </GlassCard>

      {/* List */}
      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Chưa có chủ đề nào.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((item, i) => (
              <div key={item} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors">
                {/* Index + icon */}
                <div className="w-8 h-8 rounded-lg bg-[#768064]/20 flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5 text-[#768064]" />
                </div>

                {/* Name / edit input */}
                {editName === item ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEdit(item)
                        if (e.key === 'Escape') setEditName(null)
                      }}
                      className="bg-white/5 border-[#768064]/50 h-8 text-sm"
                    />
                    <button
                      onClick={() => handleEdit(item)}
                      disabled={busyName === item}
                      className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditName(null)}
                      className="p-1.5 rounded-lg bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-foreground font-medium">{item}</span>
                    <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setEditName(item); setEditValue(item) }}
                        disabled={busyName === item}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-[#768064] hover:bg-[#768064]/10 transition-colors"
                        title="Sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={busyName === item}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
