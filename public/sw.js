// ZENVY Service Worker — Web Push Notifications
// Phiên bản: 2.0.0

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

// Xử lý Push từ server
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'ZENVY', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'ZENVY Thông báo'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-light-32x32.png',
    badge: data.badge || '/icon-dark-32x32.png',
    data: { link: data.link || '/dashboard' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    // Không dùng tag cố định — cho phép stack nhiều notifications
    timestamp: Date.now(),
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Xử lý click vào notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Nếu app đang mở → focus tab đó và navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          if ('navigate' in client) client.navigate(link)
          return
        }
      }
      // Không có tab nào → mở tab mới
      if (clients.openWindow) return clients.openWindow(link)
    })
  )
})
