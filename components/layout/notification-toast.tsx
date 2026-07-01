'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell } from 'lucide-react'
import { useAuthModal } from '@/contexts/auth-modal-context'

interface Toast {
  id: string
  type: 'BOOKING_CONFIRMED' | 'BOOKING_COMPLETED' | 'BOOKING_CANCELLED'
  title: string
  content: string
  timestamp: number
}

const TYPE_CONFIG: Record<string, { icon: string; bgColor: string; textColor: string }> = {
  BOOKING_CONFIRMED: { icon: '✅', bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
  BOOKING_COMPLETED: { icon: '🌙', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
  BOOKING_CANCELLED: { icon: '❌', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
}

export function NotificationToast() {
  const { user } = useAuthModal()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lastSeenId, setLastSeenId] = useState<number | null>(null)

  const addToast = useCallback((notification: Toast) => {
    setToasts((prev) => [notification, ...prev.slice(0, 4)]) // Keep max 5 toasts
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== notification.id))
    }, 6000) // Auto remove after 6 seconds
  }, [])

  // Poll for new notifications
  useEffect(() => {
    if (!user) return

    let isActive = true

    async function checkNewNotifications() {
      try {
        const res = await fetch(`/api/notifications?limit=1`)
        if (!res.ok) return

        const data = await res.json()
        if (data.notifications && data.notifications.length > 0) {
          const latestNotif = data.notifications[0]
          
          // Only show booking notifications (not NEW_MESSAGE)
          if (['BOOKING_CONFIRMED', 'BOOKING_COMPLETED', 'BOOKING_CANCELLED'].includes(latestNotif.type)) {
            if (!lastSeenId || latestNotif.id > lastSeenId) {
              if (isActive) {
                addToast({
                  id: `notif-${latestNotif.id}`,
                  type: latestNotif.type,
                  title: latestNotif.title,
                  content: latestNotif.content,
                  timestamp: Date.now(),
                })
                setLastSeenId(latestNotif.id)
              }
            }
          }
        }
      } catch {
        // Silently ignore polling errors
      }
    }

    checkNewNotifications()
    const interval = setInterval(checkNewNotifications, 5000) // Poll every 5 seconds

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [user, lastSeenId, addToast])

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.BOOKING_CONFIRMED

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: -20, x: 100 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`mb-3 pointer-events-auto`}
            >
              <div className={`${config.bgColor} border border-white/10 rounded-xl p-4 max-w-sm shadow-2xl shadow-black/40 backdrop-blur-xl`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${config.textColor}`}>
                      {toast.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {toast.content}
                    </p>
                  </div>
                  <button
                    onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                    className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
