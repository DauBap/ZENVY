import * as dotenv from 'dotenv'
import { sendEmail } from './lib/email'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

async function testEmail() {
  console.log('🧪 Testing email setup...\n')
  
  // Debug: Log env vars
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER)
  console.log('🔑 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? `✓ Set (${process.env.EMAIL_PASSWORD})` : '✗ Not set')
  console.log('📬 ADMIN_EMAIL:', process.env.ADMIN_EMAIL)
  console.log()

  const adminEmail = process.env.ADMIN_EMAIL || 'sageto.support@gmail.com'

  const result = await sendEmail({
    to: adminEmail,
    subject: '🧪 Test Email từ ZENVY',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #4C583E;">✅ Email Setup Thành Công!</h2>
        
        <p>Xin chúc mừng, hệ thống email ZENVY đã hoạt động bình thường.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Test Details:</strong></p>
          <p>Ngày: ${new Date().toLocaleString('vi-VN')}</p>
          <p>Email: ${adminEmail}</p>
          <p>Status: ✅ Connected</p>
        </div>

        <p style="color: #999; font-size: 12px;">
          Đây là email test tự động từ ZENVY
        </p>
      </div>
    `,
    text: 'Email setup test successful!',
  })

  if (result) {
    console.log('✅ Email sent successfully!')
    console.log(`📧 Recipient: ${adminEmail}`)
    console.log('\n✨ Email system is ready for production!')
  } else {
    console.log('❌ Failed to send email')
    console.log('💡 Check your .env.local for EMAIL_USER and EMAIL_PASSWORD')
  }

  process.exit(result ? 0 : 1)
}

testEmail().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
