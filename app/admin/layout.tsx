import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/readers')
  if (session.role !== 'ADMIN') redirect('/readers')
  return <AdminShell session={session}>{children}</AdminShell>
}
