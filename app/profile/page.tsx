import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ProfilePage } from '@/components/profile/profile-page'

export const dynamic = 'force-dynamic'

export default async function ProfileRoutePage() {
  const session = await getSession()
  if (!session) {
    redirect('/')
  }

  const userId = Number(session.sub)

  if (session.role === 'READER') {
    const reader = await prisma.readerInfo.findUnique({
      where: { user_id: userId },
      include: {
        packages: { orderBy: { id: 'asc' } },
        availability: { orderBy: { date: 'asc' } },
      },
    })
    const initial = {
      display_name: reader?.display_name ?? '',
      description: reader?.description ?? '',
      experience_year: reader?.experience_year ?? 0,
      price_per_session: reader ? Number(reader.price_per_session) : 0,
      avatar_url: reader?.avatar_url ?? '',
      rating: reader ? Number(reader.rating) : 0,
      verified: reader?.verified ?? false,
      specialty: reader?.specialty ?? [],
      packages: (reader?.packages ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        price: p.price,
        description: p.description,
        popular: p.popular,
      })),
      availability: (reader?.availability ?? []).map((a) => ({
        id: a.id,
        date: a.date.toISOString().split('T')[0],
        slots: a.slots,
      })),
    }
    return <ProfilePage role="READER" email={session.email} initial={initial} />
  }

  // CUSTOMER (mặc định)
  const customer = await prisma.customerInfo.findUnique({
    where: { user_id: userId },
  })
  const initial = {
    fullname: customer?.fullname ?? '',
    birthday: customer?.birthday ? customer.birthday.toISOString().split('T')[0] : '',
    gender: customer?.gender ?? '',
    avatar_url: customer?.avatar_url ?? '',
  }
  return <ProfilePage role="CUSTOMER" email={session.email} initial={initial} />
}
