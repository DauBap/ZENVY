import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  // Không guard trang login
  // Next.js sẽ render children trực tiếp cho /admin/login
  // nhờ vào việc kiểm tra pathname trong client nếu cần
  // Nhưng vì layout là server, ta dùng cookie để phân biệt
  if (!session) redirect('/admin/login')
  if (session.role !== 'ADMIN') redirect('/admin/login')

  return <AdminShell session={session}>{children}</AdminShell>
}
