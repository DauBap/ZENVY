import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { serializeReaders } from '@/lib/serializers'
import { readers as fallbackReaders } from '@/lib/data'

export default async function DashboardRoutePage() {
  const session = await getSession()
  if (!session) redirect('/readers?login=1')

  // Lấy danh sách readers gợi ý (chỉ dùng cho customer sidebar gợi ý)
  let readers: any[]
  try {
    const dbReaders = await prisma.readerInfo.findMany({
      orderBy: { rating: 'desc' },
      take: 6,
      include: { packages: true },
    })
    readers = dbReaders.length > 0 ? serializeReaders(dbReaders) : fallbackReaders as any
  } catch {
    readers = fallbackReaders as any
  }

  // Lấy bookings của user nếu đã đăng nhập
  let bookings: any[] = []
  let userName = 'Người dùng'
  let readerPackages: any[] = []
  let readerAvailability: any[] = []
  // Earnings snapshot cho Reader — tính từ SUM(reader_earnings) không cần cột balance
  let readerEarnings: { total: number; count: number; items: any[] } = { total: 0, count: 0, items: [] }
  const viewerRole = session?.role ?? 'CUSTOMER'

  if (session) {
    try {
      userName = session.name || 'Người dùng'

      if (viewerRole === 'READER') {
        // Reader: xem các lịch khách đã đặt với mình → query theo reader_id
        const readerInfo = await prisma.readerInfo.findUnique({
          where: { user_id: Number(session.sub) },
          include: {
            packages: { orderBy: { id: 'asc' } },
            availability: { orderBy: { date: 'asc' } },
          },
        })
        if (readerInfo) {
          readerPackages = readerInfo.packages.map((p) => ({
            id: p.id,
            name: p.name,
            duration: p.duration,
            price: p.price,
            description: p.description,
            popular: p.popular,
          }))
          readerAvailability = readerInfo.availability.map((a) => ({
            id: a.id,
            date: a.date.toISOString().split('T')[0],
            slots: a.slots,
          }))

          // Thu nhập: SUM từ reader_earnings (không cần cột balance)
          const earningsRaw = await prisma.readerEarning.findMany({
            where: { reader_id: readerInfo.id },
            orderBy: { created_at: 'desc' },
            include: {
              booking: {
                select: {
                  id: true,
                  date: true,
                  time: true,
                  customer: { select: { fullname: true } },
                  package: { select: { name: true } },
                },
              },
            },
          })
          readerEarnings = {
            total: earningsRaw.reduce((sum, e) => sum + e.amount, 0),
            count: earningsRaw.length,
            items: earningsRaw.map((e) => ({
              id: e.id,
              amount: e.amount,
              createdAt: e.created_at.toISOString(),
              bookingId: e.booking_id,
              date: e.booking?.date.toISOString().split('T')[0] ?? null,
              time: e.booking?.time ?? null,
              customerName: e.booking?.customer?.fullname ?? 'Khách hàng',
              packageName: e.booking?.package?.name ?? '',
            })),
          }

          const raw = await prisma.booking.findMany({
            where: {
              reader_id: readerInfo.id,
              // Reader thấy TẤT CẢ booking trừ CANCELLED
              // (PENDING = khách vừa đặt, reader cần biết ngay)
              status: { not: 'CANCELLED' },
            },
            include: {
              customer: { select: { id: true, fullname: true, avatar_url: true } },
              package: { select: { id: true, name: true, duration: true, price: true } },
            },
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
          })
          bookings = raw.map((b) => ({
            ...b,
            date: b.date.toISOString().split('T')[0],
            created_at: b.created_at.toISOString(),
            updated_at: b.updated_at.toISOString(),
            // Đối tác của reader là khách hàng
            counterparty: {
              id: b.customer?.id,
              name: b.customer?.fullname ?? 'Khách hàng',
              avatar: b.customer?.avatar_url ?? '/placeholder-user.jpg',
              verified: false,
            },
          }))
        }
      } else {
        // Customer: xem các lịch mình đã đặt → query theo customer_id
        const customerInfo = await prisma.customerInfo.findUnique({
          where: { user_id: Number(session.sub) },
        })
        if (customerInfo) {
          const raw = await prisma.booking.findMany({
            where: { customer_id: customerInfo.id },
            include: {
              reader: { select: { id: true, display_name: true, avatar_url: true, verified: true } },
              package: { select: { id: true, name: true, duration: true, price: true } },
            },
            orderBy: [{ date: 'asc' }, { time: 'asc' }],
          })
          bookings = raw.map((b) => ({
            ...b,
            date: b.date.toISOString().split('T')[0],
            created_at: b.created_at.toISOString(),
            updated_at: b.updated_at.toISOString(),
            // Đối tác của khách hàng là reader
            counterparty: {
              id: b.reader?.id,
              name: b.reader?.display_name ?? 'Reader',
              avatar: b.reader?.avatar_url ?? '/placeholder-user.jpg',
              verified: b.reader?.verified ?? false,
            },
          }))
        }
      }
    } catch (e) {
      console.error('Dashboard bookings error:', e)
    }
  }

  return (
    <DashboardPage
      readers={readers}
      bookings={bookings}
      userName={userName}
      viewerRole={viewerRole}
      readerPackages={readerPackages}
      readerAvailability={readerAvailability}
      readerEarnings={readerEarnings}
    />
  )
}
