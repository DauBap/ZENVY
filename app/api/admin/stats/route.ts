import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalReaders,
      activeReaders,
      totalBookings,
      todayBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue,
      totalReviews,
      avgRating,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { name: 'CUSTOMER' } } }),
      prisma.user.count({ where: { role: { name: 'READER' } } }),
      prisma.readerInfo.count({ where: { status: 'ACTIVE' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { created_at: { gte: today } } }),
      prisma.booking.count({ where: { status: 'COMPLETED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.readerEarning.aggregate({ _sum: { amount: true } }),
      prisma.sessionReview.count(),
      prisma.sessionReview.aggregate({ _avg: { rating: true } }),
    ])

    return NextResponse.json({
      totalUsers,
      totalReaders,
      activeReaders,
      totalBookings,
      todayBookings,
      completedBookings,
      cancelledBookings,
      pendingBookings,
      completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
      totalRevenue: totalRevenue._sum.amount ?? 0,
      totalReviews,
      avgRating: avgRating._avg.rating ? Math.round(avgRating._avg.rating * 10) / 10 : 0,
    })
  } catch (e) {
    console.error('Admin stats error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
