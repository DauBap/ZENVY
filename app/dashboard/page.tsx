import { prisma } from '@/lib/prisma'
import { serializeReaders } from '@/lib/serializers'
import { DashboardPage } from '@/components/dashboard/dashboard-page'

export default async function DashboardRoutePage() {
  const readers = await prisma.reader.findMany({
    orderBy: { rating: 'desc' },
    take: 6,
  })

  return <DashboardPage readers={serializeReaders(readers)} />
}
