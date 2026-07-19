# Email Integration Guide

## 📋 Setup Steps

### 1. Install Nodemailer
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### 2. Add Environment Variables
Copy content từ `.env.email.example` vào `.env.local`:

```env
EMAIL_USER=sageto.support@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
ADMIN_EMAIL=sageto.support@gmail.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Lấy Gmail App Password
1. Đến https://myaccount.google.com/apppasswords
2. Chọn Mail + Windows Computer (hoặc device của bạn)
3. Copy password 16 ký tự → dán vào `EMAIL_PASSWORD`

---

## 🔌 Integration Examples

### A. Gửi email khi có booking mới
**File:** `app/api/bookings/route.ts`

```typescript
import { notifyAdminNewBooking } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // ... existing validation code ...

    const booking = await prisma.booking.create({
      data: {
        customer_id: Number(session.sub),
        reader_id: Number(readerId),
        package_id: Number(packageId),
        date: bookingDate,
        time,
        status: 'PENDING',
      },
      include: {
        customer: { select: { user_id: true } },
        reader: { select: { name: true } },
        package: true,
      },
    })

    // ✅ THÊM: Gửi email cho admin
    const customerInfo = await prisma.customerInfo.findUnique({
      where: { user_id: Number(session.sub) },
      select: { fullname: true },
    })

    await notifyAdminNewBooking({
      customerName: customerInfo?.fullname || 'Guest',
      readerName: booking.reader.name,
      date: bookingDate.toISOString().split('T')[0],
      time,
      bookingId: booking.id,
      adminEmail: process.env.ADMIN_EMAIL || 'sageto.support@gmail.com',
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
```

---

### B. Gửi email khi có yêu cầu rút tiền
**File:** `app/api/admin/withdrawals/route.ts`

```typescript
import { notifyAdminWithdrawal } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // ... existing validation ...

    const withdrawal = await prisma.readerWithdrawal.create({
      data: {
        reader_id: readerId,
        amount,
        bank_account: bankAccount,
        status: 'PENDING',
      },
    })

    // ✅ THÊM: Gửi email cho admin
    const reader = await prisma.readerInfo.findUnique({
      where: { id: readerId },
      select: { user: { select: { name: true } } },
    })

    await notifyAdminWithdrawal({
      readerName: reader?.user.name || 'Unknown',
      amount,
      bankAccount,
      withdrawalId: withdrawal.id,
      adminEmail: process.env.ADMIN_EMAIL || 'sageto.support@gmail.com',
    })

    return NextResponse.json({ success: true, withdrawal })
  } catch (error) {
    console.error('Withdrawal error:', error)
    return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 })
  }
}
```

---

### C. Tạo hàm email tùy chỉnh
```typescript
// lib/email.ts
export async function notifyAdminCustom(data: {
  title: string
  message: string
  details: Record<string, any>
  adminEmail: string
  actionUrl?: string
  actionLabel?: string
}) {
  const detailsHtml = Object.entries(data.details)
    .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
    .join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: #4C583E;">🔔 ${data.title}</h2>
      <p>${data.message}</p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${detailsHtml}
      </div>

      ${data.actionUrl ? `
        <a href="${data.actionUrl}" 
           style="background: #4C583E; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
          ${data.actionLabel || 'Xem chi tiết'}
        </a>
      ` : ''}

      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Đây là thông báo tự động từ SageTo
      </p>
    </div>
  `

  return sendEmail({
    to: data.adminEmail,
    subject: data.title,
    html,
  })
}
```

---

## ✅ Testing

### Test email function
```bash
# Tạo file test-email.ts
tsx test-email.ts
```

```typescript
// test-email.ts
import { sendEmail } from './lib/email'

async function test() {
  const result = await sendEmail({
    to: 'sageto.support@gmail.com',
    subject: 'Test email từ ZENVY',
    html: '<h1>Nó hoạt động! 🎉</h1>',
  })
  console.log('Email sent:', result)
}

test()
```

---

## 🚀 Production Checklist

- [ ] `.env.local` có tất cả email variables
- [ ] Gmail App Password đã được tạo
- [ ] Test sending 1 email thành công
- [ ] Tích hợp vào ít nhất 1 API route
- [ ] Check email logs trong code

---

## 📊 Monitoring

Check email logs:
```bash
# Terminal
npm run dev  # Xem logs khi email được gửi
```

Output:
```
✅ Email sent: <message-id>
```

---

## ⚠️ Troubleshooting

| Lỗi | Nguyên nhân | Giải pháp |
|---|---|---|
| "Invalid login" | App Password sai | Tạo lại App Password mới |
| Email không gửi | EMAIL_USER/PASSWORD chưa set | Kiểm tra `.env.local` |
| "Too many login failures" | Rate limit Gmail | Đợi 30 phút hoặc dùng SendGrid |
| Email đến spam | Gmail security | Thêm SPF/DKIM record (nếu production) |

---

## 🎯 Next Steps

1. ✅ Install nodemailer
2. ✅ Setup .env variables
3. ✅ Integrate vào 1-2 API routes
4. ✅ Test
5. Khi scale up: Migrate to SendGrid
