// Mention token: lưu dạng "@[Tên](userId)" để biết mỗi mention trỏ tới user nào.
// Khung soạn thảo hiển thị "@Tên" sạch; convert sang/từ token khi lưu/sửa.

export interface Mention {
  name: string
  userId: number
}

export const MENTION_TOKEN_RE = /@\[([^\]]+)\]\((\d+)\)/g

// Text sạch ("@Tên") + danh sách mention → nội dung token để lưu DB
export function toTokens(text: string, mentions: Mention[]): string {
  // Thay tên dài trước để tránh tên ngắn là tiền tố của tên dài
  const sorted = [...mentions].sort((a, b) => b.name.length - a.name.length)
  let result = text
  for (const m of sorted) {
    const escaped = m.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // "@Tên" → token. Token đã có "@[" nên không bị thay lại (ký tự sau @ là "[")
    result = result.replace(new RegExp(`@${escaped}`, 'g'), `@[${m.name}](${m.userId})`)
  }
  return result
}

// Nội dung token → { text sạch để hiển thị trong ô soạn thảo, danh sách mention }
export function fromTokens(content: string): { text: string; mentions: Mention[] } {
  const mentions: Mention[] = []
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g')
  const text = content.replace(re, (_full, name: string, id: string) => {
    mentions.push({ name, userId: Number(id) })
    return `@${name}`
  })
  return { text, mentions }
}
