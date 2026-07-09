import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is not defined in the environment')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

async function ensureUser(email: string, roleName: 'CUSTOMER' | 'READER' | 'ADMIN', displayName: string) {
  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName, description: `${roleName} role` },
  })

  const passwordHash = await bcrypt.hash('1234', 10)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash: passwordHash,
      role_id: role.id,
      status: 'ACTIVE',
    },
    create: {
      email,
      password_hash: passwordHash,
      role_id: role.id,
      status: 'ACTIVE',
    },
  })

  if (roleName === 'READER') {
    await prisma.readerInfo.upsert({
      where: { user_id: user.id },
      update: { display_name: displayName, description: 'Test reader account' },
      create: {
        user_id: user.id,
        display_name: displayName,
        description: 'Test reader account',
        price_per_session: 0,
        rating: new Prisma.Decimal('0'),
      },
    })
  }

  if (roleName === 'CUSTOMER') {
    await prisma.customerInfo.upsert({
      where: { user_id: user.id },
      update: { fullname: displayName },
      create: { user_id: user.id, fullname: displayName },
    })
  }

  return { id: user.id, email: user.email, role: roleName }
}

async function main() {
  const accounts = [
    { email: 'viet@sagetotest.com', roleName: 'READER' as const, displayName: 'Reader Viet' },
    { email: 'admin@sagetotest.com', roleName: 'ADMIN' as const, displayName: 'Admin SAGETO' },
    { email: 'customer@sagetotest.com', roleName: 'CUSTOMER' as const, displayName: 'Customer SAGETO' },
  ]

  for (const account of accounts) {
    const result = await ensureUser(account.email, account.roleName, account.displayName)
    console.log(`Created/updated: ${result.email} (${result.role})`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
