import { NextRequest, NextResponse } from 'next/server'
import { payos, isPayosConfigured, markBookingPaidByOrderCode } from '@/lib/payos'

// ===========================================================================
// POST /api/payos/webhook
//   Endpoint nhận thông báo thanh toán từ PayOS.
//   - Xác thực chữ ký qua payos.webhooks.verify (chống giả mạo).
//   - Khi thanh toán thành công → chuyển booking PENDING → PAYMENT_CONFIRMED.
//   Luôn trả 200 để PayOS không retry vô hạn khi lỗi nghiệp vụ của ta.
//
// Đăng ký URL này tại https://my.payos.vn (Webhook), hoặc gọi
// payos.webhooks.confirm('<APP_URL>/api/payos/webhook') một lần.
// ===========================================================================

export async function POST(request: NextRequest) {
  if (!isPayosConfigured) {
    return NextResponse.json({ error: 'PayOS chưa được cấu hình.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload không hợp lệ.' }, { status: 400 })
  }

  // Xác thực chữ ký — verify sẽ throw nếu chữ ký sai
  let data
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = await payos.webhooks.verify(body as any)
  } catch (error) {
    console.error('PayOS webhook signature verify failed:', error)
    return NextResponse.json({ error: 'Chữ ký không hợp lệ.' }, { status: 401 })
  }

  try {
    // code '00' = giao dịch thành công
    if (data.code === '00' && data.orderCode) {
      await markBookingPaidByOrderCode(data.orderCode)
    }
  } catch (error) {
    // Lỗi nghiệp vụ phía ta — log nhưng vẫn ack để PayOS không retry vô hạn
    console.error('PayOS webhook handling error:', error)
  }

  return NextResponse.json({ success: true })
}
