"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function AdminSpecialtiesPage() {
  const [list, setList] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => { fetchList() }, [])

  async function fetchList() {
    setLoading(true)
    const res = await fetch('/api/admin/specialties')
    const data = await res.json()
    setList(data.specialties || [])
    setLoading(false)
  }

  async function create() {
    if (!value.trim()) return
    const res = await fetch('/api/admin/specialties', { method: 'POST', body: JSON.stringify({ name: value.trim() }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (res.ok) { setList(data.specialties); setValue('') }
  }

  async function startEdit(name: string) { setEditing(name); setValue(name) }
  async function saveEdit() {
    if (!editing) return
    const res = await fetch('/api/admin/specialties', { method: 'PUT', body: JSON.stringify({ oldName: editing, newName: value.trim() }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (res.ok) { setList(data.specialties); setEditing(null); setValue('') }
  }

  async function remove(name: string) {
    if (!confirm(`Xóa chủ đề "${name}"?`)) return
    const res = await fetch('/api/admin/specialties', { method: 'DELETE', body: JSON.stringify({ name }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (res.ok) setList(data.specialties)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-foreground mb-4">Quản lý Chủ đề (Specialties)</h2>
      <div className="flex gap-2 mb-4">
        <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Tên chủ đề" />
        {editing ? (
          <>
            <Button onClick={saveEdit}>Lưu</Button>
            <Button variant="outline" onClick={() => { setEditing(null); setValue('') }}>Hủy</Button>
          </>
        ) : (
          <Button onClick={create}>Thêm</Button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? <div>Đang tải...</div> : list.map((s) => (
          <div key={s} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border-[var(--border)]">
            <div className="text-foreground">{s}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(s)}>Sửa</Button>
              <Button size="sm" variant="destructive" onClick={() => remove(s)}>Xóa</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
