import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { serializeReaders } from '@/lib/serializers'
import { readers as fallbackReaders } from '@/lib/data'

export default async function DashboardRoutePage() {
  const session = await getSession()

  // Lấy danh sách readers gợi ý
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

  if (session) {
    try {
      userName = session.name || 'Người dùng'
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
        }))
      }
    } catch (e) {
      console.error('Dashboard bookings error:', e)
    }
  }

  return <DashboardPage readers={readers} bookings={bookings} userName={userName} />
}
