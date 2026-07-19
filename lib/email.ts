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
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(data: {
  to: string
  resetUrl: string
  appName?: string
}) {
  const appName = data.appName || 'SAGETO'

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #4C583E 0%, #2C3424 100%); padding: 32px 24px; text-align: center;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.15); line-height: 48px; font-size: 28px; margin-bottom: 8px;">☽</div>
        <h1 style="color: #ffffff; margin: 8px 0 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">${appName}</h1>
      </div>

      <!-- Body -->
      <div style="padding: 32px 24px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 16px;">Xin chào,</p>
        
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        </p>
        
        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Để tạo mật khẩu mới, vui lòng nhấn vào nút bên dưới:
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 24px 0;">
          <a href="${data.resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #4C583E 0%, #2C3424 100%); color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(76, 88, 62, 0.3);">
            🔑 Đặt lại mật khẩu
          </a>
        </div>

        <p style="color: #777; font-size: 13px; line-height: 1.6; margin: 24px 0 8px;">
          Hoặc sao chép và mở liên kết sau trong trình duyệt:
        </p>
        <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 6px; word-break: break-all; margin: 0 0 24px;">
          <a href="${data.resetUrl}" style="color: #4C583E; font-size: 13px; text-decoration: none;">${data.resetUrl}</a>
        </div>

        <div style="background: #FFF8E1; border-left: 4px solid #FFC107; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 0 0 24px;">
          <p style="color: #856404; font-size: 14px; margin: 0;">
            ⏰ Liên kết này sẽ hết hạn sau <strong>30 phút</strong> vì lý do bảo mật.
          </p>
        </div>

        <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
          Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không bị thay đổi.
        </p>

        <p style="color: #777; font-size: 14px; line-height: 1.6; margin: 0;">
          Nếu bạn cần hỗ trợ, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #f9f9f9; padding: 20px 24px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 13px; margin: 0;">
          Trân trọng,<br/>
          <strong style="color: #4C583E;">Đội ngũ ${appName}</strong>
        </p>
        <p style="color: #ccc; font-size: 11px; margin: 12px 0 0;">
          Đây là email tự động, vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `

  const text = `Xin chào,

Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Để tạo mật khẩu mới, vui lòng mở liên kết sau trong trình duyệt:

${data.resetUrl}

Liên kết này sẽ hết hạn sau 30 phút vì lý do bảo mật.

Nếu bạn không thực hiện yêu cầu này, bạn có thể bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không bị thay đổi.

Trân trọng,
Đội ngũ ${appName}`

  return sendEmail({
    to: data.to,
    subject: `🔑 Đặt lại mật khẩu - ${appName}`,
    html,
    text,
  })
}

/**
 * Email báo reader biết hồ sơ đã được admin phê duyệt
 */
export async function notifyReaderApproved(data: {
  to: string
  readerName?: string
  appUrl?: string
  appName?: string
}) {
  const appName = data.appName || 'SAGETO'
  const appUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://sageto.net'
  const greeting = data.readerName ? `Xin chào ${data.readerName},` : 'Xin chào,'

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #4C583E 0%, #2C3424 100%); padding: 32px 24px; text-align: center;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.15); line-height: 48px; font-size: 28px; margin-bottom: 8px;">☽</div>
        <h1 style="color: #ffffff; margin: 8px 0 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">${appName}</h1>
      </div>

      <div style="padding: 32px 24px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 16px;">${greeting}</p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Chúc mừng! Hồ sơ đăng ký trở thành <strong>Tarot Reader</strong> của bạn đã được phê duyệt.
        </p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Từ bây giờ, bạn đã có thể:
        </p>

        <ul style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 24px; padding-left: 24px;">
          <li>Hoàn thiện hồ sơ cá nhân.</li>
          <li>Thiết lập lịch làm việc.</li>
          <li>Nhận và quản lý các booking từ khách hàng.</li>
          <li>Bắt đầu hành trình kết nối và đồng hành cùng những người cần sự tư vấn.</li>
        </ul>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Đăng nhập ngay để bắt đầu:</p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${appUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #4C583E 0%, #2C3424 100%); color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(76, 88, 62, 0.3);">
            Đăng nhập ngay
          </a>
        </div>

        <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 6px; word-break: break-all; margin: 0 0 24px;">
          <a href="${appUrl}" style="color: #4C583E; font-size: 13px; text-decoration: none;">${appUrl}</a>
        </div>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Cảm ơn bạn đã trở thành một phần của <strong>${appName}</strong>. Chúng tôi hy vọng nền tảng sẽ giúp bạn tiếp cận nhiều khách hàng hơn và phát triển công việc của mình.
        </p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0;">
          Chúc bạn có thật nhiều phiên đọc ý nghĩa!
        </p>
      </div>

      <div style="background: #f9f9f9; padding: 20px 24px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 13px; margin: 0;">
          Trân trọng,<br/>
          <strong style="color: #4C583E;">Đội ngũ ${appName}</strong>
        </p>
        <p style="color: #ccc; font-size: 11px; margin: 12px 0 0;">
          Đây là email tự động, vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `

  const text = `${greeting}

Chúc mừng! Hồ sơ đăng ký trở thành Tarot Reader của bạn đã được phê duyệt.

Từ bây giờ, bạn đã có thể:
- Hoàn thiện hồ sơ cá nhân.
- Thiết lập lịch làm việc.
- Nhận và quản lý các booking từ khách hàng.
- Bắt đầu hành trình kết nối và đồng hành cùng những người cần sự tư vấn.

Đăng nhập ngay để bắt đầu:
${appUrl}

Cảm ơn bạn đã trở thành một phần của ${appName}. Chúng tôi hy vọng nền tảng sẽ giúp bạn tiếp cận nhiều khách hàng hơn và phát triển công việc của mình.

Chúc bạn có thật nhiều phiên đọc ý nghĩa!

Trân trọng,
Đội ngũ ${appName}`

  return sendEmail({
    to: data.to,
    subject: `🎉 Hồ sơ Reader của bạn đã được phê duyệt - ${appName}`,
    html,
    text,
  })
}

/**
 * Email báo reader biết hồ sơ bị từ chối kèm lý do
 */
export async function notifyReaderRejected(data: {
  to: string
  readerName?: string
  reason: string
  appUrl?: string
  appName?: string
}) {
  const appName = data.appName || 'SAGETO'
  const appUrl = data.appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://sageto.net'
  const greeting = data.readerName ? `Xin chào ${data.readerName},` : 'Xin chào,'
  const reason = data.reason || 'Chưa đáp ứng đủ điều kiện ở thời điểm hiện tại.'

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #4C583E 0%, #2C3424 100%); padding: 32px 24px; text-align: center;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.15); line-height: 48px; font-size: 28px; margin-bottom: 8px;">☽</div>
        <h1 style="color: #ffffff; margin: 8px 0 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">${appName}</h1>
      </div>

      <div style="padding: 32px 24px;">
        <p style="color: #333; font-size: 16px; margin: 0 0 16px;">${greeting}</p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Cảm ơn bạn đã đăng ký trở thành <strong>Tarot Reader</strong> trên ${appName}.
        </p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Sau khi xem xét, rất tiếc chúng tôi <strong>chưa thể phê duyệt</strong> hồ sơ của bạn ở thời điểm hiện tại.
        </p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 8px;"><strong>Lý do:</strong></p>
        <div style="background: #FFF8E1; border-left: 4px solid #FFC107; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 0 0 24px;">
          <p style="color: #856404; font-size: 14px; line-height: 1.6; margin: 0;">${reason}</p>
        </div>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Bạn hoàn toàn có thể chỉnh sửa hoặc bổ sung thông tin theo góp ý ở trên và gửi lại hồ sơ để chúng tôi xem xét một lần nữa.
        </p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Truy cập ứng dụng để cập nhật hồ sơ:</p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${appUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #4C583E 0%, #2C3424 100%); color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(76, 88, 62, 0.3);">
            Cập nhật hồ sơ
          </a>
        </div>

        <div style="background: #f5f5f5; padding: 12px 16px; border-radius: 6px; word-break: break-all; margin: 0 0 24px;">
          <a href="${appUrl}" style="color: #4C583E; font-size: 13px; text-decoration: none;">${appUrl}</a>
        </div>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
          Chúng tôi luôn mong muốn mang đến trải nghiệm tốt nhất cho cả Reader và khách hàng, vì vậy quá trình xét duyệt được thực hiện nhằm đảm bảo chất lượng dịch vụ trên nền tảng.
        </p>

        <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0;">
          Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với đội ngũ hỗ trợ. Chúng tôi luôn sẵn sàng hỗ trợ bạn.
        </p>
      </div>

      <div style="background: #f9f9f9; padding: 20px 24px; text-align: center; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 13px; margin: 0;">
          Trân trọng,<br/>
          <strong style="color: #4C583E;">Đội ngũ ${appName}</strong>
        </p>
        <p style="color: #ccc; font-size: 11px; margin: 12px 0 0;">
          Đây là email tự động, vui lòng không trả lời email này.
        </p>
      </div>
    </div>
  `

  const text = `${greeting}

Cảm ơn bạn đã đăng ký trở thành Tarot Reader trên ${appName}.

Sau khi xem xét, rất tiếc chúng tôi chưa thể phê duyệt hồ sơ của bạn ở thời điểm hiện tại.

Lý do:
${reason}

Bạn hoàn toàn có thể chỉnh sửa hoặc bổ sung thông tin theo góp ý ở trên và gửi lại hồ sơ để chúng tôi xem xét một lần nữa.

Truy cập ứng dụng để cập nhật hồ sơ:
${appUrl}

Chúng tôi luôn mong muốn mang đến trải nghiệm tốt nhất cho cả Reader và khách hàng, vì vậy quá trình xét duyệt được thực hiện nhằm đảm bảo chất lượng dịch vụ trên nền tảng.

Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với đội ngũ hỗ trợ. Chúng tôi luôn sẵn sàng hỗ trợ bạn.

Trân trọng,
Đội ngũ ${appName}`

  return sendEmail({
    to: data.to,
    subject: `Thông báo hồ sơ Reader - ${appName}`,
    html,
    text,
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
