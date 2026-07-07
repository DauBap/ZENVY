// SAGETO Service Worker — Web Push Notifications
// Phiên bản: 1.0.0

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
    data = { title: 'SAGETO', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'SAGETO Thông báo'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-light-32x32.png',
    badge: data.badge || '/icon-dark-32x32.png',
    data: { link: data.link || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: 'sageto-notification',  // replace cùng tag thay vì stack
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Xử lý click vào notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Nếu app đang mở → focus tab đó
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(link)
          return
        }
      }
      // Không có tab nào → mở tab mới
      if (clients.openWindow) return clients.openWindow(link)
    })
  )
})
