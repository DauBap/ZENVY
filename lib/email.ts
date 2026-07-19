import nodemailer from 'nodemailer'
import { formatAmountK } from '@/lib/utils'

// Create transporter lazily (after env vars are loaded)
function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send email notification
 * @param options Email configuration
 */
export async function sendEmail(options: EmailOptions) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email credentials not configured')
    return false
  }

  try {
    const transporter = getTransporter()
    const result = await transporter.sendMail({
      from: `"ZENVY Admin" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log('✅ Email sent:', result.messageId)
    return true
  } catch (error) {
    console.error('❌ Email error:', error)
    return false
  }
}

/**
 * Send admin notification for new booking
 */
export async function notifyAdminNewBooking(data: {
  customerName: string
  readerName: string
  date: string
  time: string
  bookingId: number
  adminEmail: string
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #4C583E;">🆕 Có lịch hẹn mới</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Khách hàng:</strong> ${data.customerName}</p>
        <p><strong>Reader:</strong> ${data.readerName}</p>
        <p><strong>Ngày:</strong> ${data.date}</p>
        <p><strong>Giờ:</strong> ${data.time}</p>
        <p><strong>Booking ID:</strong> #${data.bookingId}</p>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings" 
         style="background: #4C583E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Xem chi tiết
      </a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Đây là thông báo tự động từ ZENVY
      </p>
    </div>
  `

  return sendEmail({
    to: data.adminEmail,
    subject: `🆕 Lịch hẹn mới - ${data.customerName} → ${data.readerName}`,
    html,
    text: `Có lịch hẹn mới từ ${data.customerName} đặt với ${data.readerName} vào ${data.date} lúc ${data.time}`,
  })
}

/**
 * Send admin notification for withdrawal request
 */
export async function notifyAdminWithdrawal(data: {
  readerName: string
  amount: number
  bankAccount: string
  withdrawalId: number
  adminEmail: string
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #4C583E;">💰 Yêu cầu rút tiền</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reader:</strong> ${data.readerName}</p>
        <p><strong>Số tiền:</strong> ${formatAmountK(data.amount)}</p>
        <p><strong>Tài khoản:</strong> ${data.bankAccount}</p>
        <p><strong>ID yêu cầu:</strong> #${data.withdrawalId}</p>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/withdrawals" 
         style="background: #4C583E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Xử lý yêu cầu
      </a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Đây là thông báo tự động từ ZENVY
      </p>
    </div>
  `

  return sendEmail({
    to: data.adminEmail,
    subject: `💰 Yêu cầu rút tiền - ${formatAmountK(data.amount)} từ ${data.readerName}`,
    html,
    text: `${data.readerName} yêu cầu rút ${formatAmountK(data.amount)}`,
  })
}

/**
 * Send admin notification for new reader registration request
 */
export async function notifyAdminReaderRegistration(data: {
  readerName: string
  nickname?: string
  email?: string
  phone?: string
  experienceYear?: number
  specialties?: string[]
  description?: string
  facebook?: string
  adminEmail: string
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #4C583E;">👤 Yêu cầu đăng ký Reader mới</h2>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tên thật:</strong> ${data.readerName}</p>
        ${data.nickname ? `<p><strong>Nickname (hiển thị công khai):</strong> ${data.nickname}</p>` : ''}
        <p><strong>Email:</strong> ${data.email || '—'}</p>
        <p><strong>Điện thoại:</strong> ${data.phone || '—'}</p>
        <p><strong>Kinh nghiệm:</strong> ${typeof data.experienceYear === 'number' ? `${data.experienceYear} năm` : '—'}</p>
        <p><strong>Chuyên môn:</strong> ${(data.specialties && data.specialties.length) ? data.specialties.join(', ') : '—'}</p>
        <p><strong>Mô tả bản thân:</strong> ${data.description ? data.description.replace(/\n/g, '<br/>') : '—'}</p>
        ${data.facebook ? `<p><strong>Facebook:</strong> <a href="${data.facebook}" target="_blank" rel="noopener noreferrer">${data.facebook}</a></p>` : ''}
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/readers" 
         style="background: #4C583E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Xem yêu cầu
      </a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Đây là thông báo tự động từ ZENVY
      </p>
    </div>
  `

  const plainTextParts = [
    `Tên thật: ${data.readerName}`,
    data.nickname ? `Nickname: ${data.nickname}` : undefined,
    data.email ? `Email: ${data.email}` : undefined,
    data.phone ? `Điện thoại: ${data.phone}` : undefined,
    typeof data.experienceYear === 'number' ? `Kinh nghiệm: ${data.experienceYear} năm` : undefined,
    (data.specialties && data.specialties.length) ? `Chuyên môn: ${data.specialties.join(', ')}` : undefined,
    data.description ? `Mô tả: ${data.description}` : undefined,
    data.facebook ? `Facebook: ${data.facebook}` : undefined,
  ].filter(Boolean).join('\n')

  return sendEmail({
    to: data.adminEmail,
    subject: `👤 Yêu cầu đăng ký Reader mới - ${data.readerName}`,
    html,
    text: `Có yêu cầu đăng ký reader mới:\n${plainTextParts}`,
  })
}

/**
 * Send admin notification for payment confirmation
 */
export async function notifyAdminPaymentConfirm(data: {
  customerName: string
  amount: number
  method: string
  paymentId: number
  adminEmail: string
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #4C583E;">💳 Thanh toán mới</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Khách hàng:</strong> ${data.customerName}</p>
        <p><strong>Số tiền:</strong> ${formatAmountK(data.amount)}</p>
        <p><strong>Phương thức:</strong> ${data.method}</p>
        <p><strong>Payment ID:</strong> #${data.paymentId}</p>
      </div>

      <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/payments" 
         style="background: #4C583E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
        Xác nhận thanh toán
      </a>

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Đây là thông báo tự động từ ZENVY
      </p>
    </div>
  `

  return sendEmail({
    to: data.adminEmail,
    subject: `💳 Thanh toán ${formatAmountK(data.amount)} từ ${data.customerName}`,
    html,
    text: `${data.customerName} thanh toán ${formatAmountK(data.amount)} qua ${data.method}`,
  })
}
