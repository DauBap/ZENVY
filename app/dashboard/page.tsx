import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { serializeReaders } from '@/lib/serializers'

export default async function DashboardRoutePage() {
  const session = await getSession()
  if (!session) redirect('/readers?login=1')

  let readers: any[] = []
  let bookings: any[] = []
  let userName = session.name || 'Người dùng'
  let viewerRole = 'CUSTOMER'
  let readerPackages: any[] = []
  let readerAvailability: any[] = []
  let readerEarnings: any = undefined

  try {
    // Gợi ý readers cho customer sidebar
    const dbReaders = await prisma.readerInfo.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { rating: 'desc' },
      take: 6,
      include: {
        packages: true,
        _count: { select: { reviews: true, session_reviews: true } },
      },
    })
    readers = dbReaders.length > 0 ? serializeReaders(dbReaders) : []
  } catch {
    readers = []
  }

  try {
    const userId = Number(session.sub)

    // Kiểm tra reader status
    const readerInfo = await prisma.readerInfo.findUnique({
      where: { user_id: userId },
      include: {
        packages: { orderBy: { id: 'asc' } },
        availability: { orderBy: { date: 'asc' } },
      },
    })

    const isActiveReader = readerInfo?.status === 'ACTIVE'

    if (isActiveReader && readerInfo) {
      viewerRole = 'READER'

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

      // Thu nhập reader — chỉ lấy 100 gần nhất, tổng tính riêng bằng aggregate
      const [earningsAgg, earningsRaw] = await Promise.all([
        prisma.readerEarning.aggregate({
          where: { reader_id: readerInfo.id },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.readerEarning.findMany({
          where: { reader_id: readerInfo.id },
          orderBy: { created_at: 'desc' },
          take: 100,
          include: {
            booking: {
              select: {
                id: true,
                date: true,
                time: true,
                package: { select: { name: true } },
                requester: {
                  select: {
                    customer_info: { select: { fullname: true } },
                    reader_info: { select: { display_name: true } },
                  },
                },
              },
            },
          },
        }),
      ])

      readerEarnings = {
        total: earningsAgg._sum.amount ?? 0,
        count: earningsAgg._count,
        items: earningsRaw.map((e) => ({
          id: e.id,
          amount: e.amount,
          createdAt: e.created_at.toISOString(),
          bookingId: e.booking_id,
          date: e.booking?.date.toISOString().split('T')[0] ?? null,
          time: e.booking?.time ?? null,
          customerName:
            e.booking?.requester?.customer_info?.fullname ??
            e.booking?.requester?.reader_info?.display_name ??
            'Khách hàng',
          packageName: e.booking?.package?.name ?? '',
        })),
      }

      // Bookings của reader (provider) — chỉ lấy 200 gần nhất
      const raw = await prisma.booking.findMany({
        where: {
          provider_id: userId,
          status: { in: ['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
        },
        include: {
          requester: {
            select: {
              id: true,
              customer_info: { select: { fullname: true, avatar_url: true } },
              reader_info: { select: { display_name: true, avatar_url: true } },
            },
          },
          package: { select: { id: true, name: true, duration: true, price: true } },
        },
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        take: 200,
      })

      bookings = raw.map((b) => ({
        ...b,
        date: b.date.toISOString().split('T')[0],
        created_at: b.created_at.toISOString(),
        updated_at: b.updated_at.toISOString(),
        counterparty: {
          id: b.requester?.id,
          name:
            b.requester?.customer_info?.fullname ??
            b.requester?.reader_info?.display_name ??
            'Khách hàng',
          avatar:
            b.requester?.customer_info?.avatar_url ??
            b.requester?.reader_info?.avatar_url ??
            '/placeholder-user.jpg',
          verified: false,
        },
      }))
    } else {
      // Customer: bookings mình đã đặt (requester) — chỉ lấy 200 gần nhất
      const raw = await prisma.booking.findMany({
        where: {
          requester_id: userId,
          status: { in: ['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
        },
        include: {
          provider: {
            select: {
              id: true,
              reader_info: { select: { id: true, display_name: true, avatar_url: true, verified: true } },
            },
          },
          package: { select: { id: true, name: true, duration: true, price: true } },
        },
        orderBy: [{ date: 'desc' }, { time: 'desc' }],
        take: 200,
      })

      bookings = raw.map((b) => ({
        ...b,
        date: b.date.toISOString().split('T')[0],
        created_at: b.created_at.toISOString(),
        updated_at: b.updated_at.toISOString(),
        counterparty: {
          id: b.provider?.reader_info?.id,
          name: b.provider?.reader_info?.display_name ?? 'Reader',
          avatar: b.provider?.reader_info?.avatar_url ?? '/placeholder-user.jpg',
          verified: b.provider?.reader_info?.verified ?? false,
        },
      }))
    }
  } catch (e) {
    console.error('Dashboard error:', e)
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
