'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'
import { usePushNotification } from '@/hooks/use-push-notification'

interface Notification {
  id: number
  title: string
  content: string
  type: string
  isRead: boolean
  link: string | null
  createdAt: string
}

const TYPE_ICON: Record<string, string> = {
  BOOKING_CONFIRMED:  '✅',
  BOOKING_COMPLETED:  '🌙',
  BOOKING_CANCELLED:  '❌',
  NEW_MESSAGE:        '💬',
  WITHDRAWAL_APPROVED:'💰',
  WITHDRAWAL_REJECTED:'⚠️',
  SYSTEM:             '📢',
}

export function NotificationBell() {
  const { user } = useAuthModal()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Đăng ký push notification khi user login
  usePushNotification(!!user)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (!res.ok) return
      const data = await res.json()
      // Filter to show only booking-related notifications (not messages)
      const bookingNotifications = (data.notifications ?? []).filter(
        (n: Notification) => !['NEW_MESSAGE'].includes(n.type)
      )
      setNotifications(bookingNotifications)
      // Count all unread notifications excluding messages
      const unreadBookingNotifications = bookingNotifications.filter((n: Notification) => !n.isRead)
      setUnreadCount(unreadBookingNotifications.length)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load khi mount + poll mỗi 5s (cập nhật nhanh hơn)
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Fetch lại khi mở dropdown
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open, fetchNotifications])

  // Đóng khi click ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function markAllRead() {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  async function markOneRead(id: number, link: string | null) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    setOpen(false)
    if (link) window.location.href = link
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(v => !v); if (!open) fetchNotifications() }}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-card shadow-2xl shadow-black/40 backdrop-blur-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#768064]" />
              <span className="font-semibold text-foreground text-sm">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  {unreadCount} mới
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#768064] hover:bg-[#768064]/10 transition-colors"
                >
                  <Check className="w-3 h-3" /> Đọc hết
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-100 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#768064]/30 border-t-[#A5B38B] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n.id, n.link)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0',
                    n.isRead ? 'hover:bg-white/5' : 'bg-[#768064]/10 hover:bg-[#768064]/15'
                  )}
                >
                  <span className="text-lg shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? '📢'}</span>
                  <div className="flex-1 min-w-0">
                    <div className={cn('text-sm font-medium truncate', n.isRead ? 'text-muted-foreground' : 'text-foreground')}>
                      {n.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.content}</div>
                    <div className="text-xs text-white/30 mt-1">
                      {new Date(n.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#768064] shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
