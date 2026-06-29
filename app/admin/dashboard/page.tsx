import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminDashboardPage() {
  const session = await getSession()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const [
    totalUsers, totalReaders, totalBookings, todayBookings,
    completedBookings, cancelledBookings, pendingBookings,
    revenueAgg, totalReviews, ratingAgg,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { name: 'CUSTOMER' } } }),
    prisma.user.count({ where: { role: { name: 'READER' } } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { created_at: { gte: today } } }),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.readerEarning.aggregate({ _sum: { amount: true } }),
    prisma.sessionReview.count(),
    prisma.sessionReview.aggregate({ _avg: { rating: true } }),
    prisma.booking.findMany({
      take: 8, orderBy: { created_at: 'desc' },
      include: {
        customer: { select: { fullname: true } },
        reader: { select: { display_name: true } },
        package: { select: { name: true, price: true } },
      },
    }),
  ])

  const stats = {
    totalUsers, totalReaders, totalBookings, todayBookings,
    completedBookings, cancelledBookings, pendingBookings,
    completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
    totalRevenue: Number(revenueAgg._sum.amount ?? 0),
    totalReviews,
    avgRating: ratingAgg._avg.rating ? Math.round(Number(ratingAgg._avg.rating) * 10) / 10 : 0,
  }

  const bookings = recentBookings.map(b => ({
    id: b.id,
    date: b.date.toISOString().split('T')[0],
    time: b.time,
    status: b.status,
    customer: b.customer.fullname ?? '—',
    reader: b.reader.display_name ?? '—',
    packageName: b.package.name,
    amount: b.package.price,
    createdAt: b.created_at.toISOString(),
  }))

  return <AdminDashboard stats={stats} recentBookings={bookings} />
}
