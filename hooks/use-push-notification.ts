'use client'

import { useEffect } from 'react'

/**
 * Đăng ký Service Worker và subscribe Web Push khi user đã đăng nhập.
 * Gọi hook này một lần trong layout sau khi biết user đã login.
 */
export function usePushNotification(isLoggedIn: boolean) {
  useEffect(() => {
    if (!isLoggedIn) return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    async function register() {
      try {
        // 1. Đăng ký service worker
        const reg = await navigator.serviceWorker.register('/sw.js')

        // 2. Xin quyền push
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // 3. Lấy VAPID public key từ env
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) return

        // 4. Subscribe
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        // 5. Gửi subscription lên server
        await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        })
      } catch {
        // Không throw — push là tính năng optional
      }
    }

    register()
  }, [isLoggedIn])
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}
