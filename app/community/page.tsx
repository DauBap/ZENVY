import { getSession } from '@/lib/auth'
import { CommunityPage } from '@/components/community/community-page'

export const dynamic = 'force-dynamic'

export default async function CommunityRoutePage() {
  const session = await getSession()
  return <CommunityPage isLoggedIn={!!session} />
}
