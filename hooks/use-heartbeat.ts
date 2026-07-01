import { useEffect } from 'react'

const INTERVAL_MS = 30_000 // ping mỗi 30 giây

/**
 * Gọi POST /api/reader/heartbeat mỗi 30s để đánh dấu reader đang online.
 * Chỉ dùng trong component của reader khi đã đăng nhập.
 */
export function useHeartbeat(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const ping = () => {
      fetch('/api/reader/heartbeat', { method: 'POST' }).catch(() => {})
    }

    ping() // ping ngay khi mount
    const id = setInterval(ping, INTERVAL_MS)
    return () => clearInterval(id)
  }, [enabled])
}
