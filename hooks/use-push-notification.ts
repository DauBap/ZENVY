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

    // Kiểm tra permission hiện tại — không hỏi lại nếu đã bị từ chối
    if (Notification.permission === 'denied') return

    async function register() {
      try {
        // 1. Đăng ký service worker
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

        // Chờ SW active
        await navigator.serviceWorker.ready

        // 2. Lấy VAPID public key từ env
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidKey) {
          console.warn('[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY chưa được cấu hình.')
          return
        }

        // 3. Kiểm tra subscription hiện tại
        const existingSub = await reg.pushManager.getSubscription()
        if (existingSub) {
          // Đã subscribe rồi — đồng bộ lên server phòng trường hợp mất
          await fetch('/api/push-subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(existingSub.toJSON()),
          })
          return
        }

        // 4. Xin quyền push (chỉ hỏi khi chưa có subscription)
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // 5. Subscribe
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        })

        // 6. Gửi subscription lên server
        const res = await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        })

        if (!res.ok) {
          console.warn('[Push] Không thể lưu subscription:', await res.text())
        }
      } catch (err) {
        // Không throw — push là tính năng optional
        console.warn('[Push] Đăng ký thất bại:', err)
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
