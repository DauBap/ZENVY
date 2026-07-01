// Online nếu last_seen_at trong vòng 2 phút
export const ONLINE_THRESHOLD_MS = 2 * 60 * 1000

export function isReaderOnline(lastSeenAt: Date | null | undefined): boolean {
  if (!lastSeenAt) return false
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_THRESHOLD_MS
}
