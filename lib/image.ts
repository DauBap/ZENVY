'use client'

// Resize ảnh về tối đa `max` px rồi xuất base64 (webp) để chuỗi nhỏ gọn.
// Dùng cho avatar (profile) và ảnh bài đăng (forum).
export function resizeImage(file: File, max = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas context'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/webp', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
