import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

async function main() {
  const readerRole = await prisma.role.upsert({
    where: { name: 'READER' },
    update: {},
    create: { name: 'READER', description: 'READER role' },
  })

  const baseEmail = 'reader_account@sageto.com'
  let email = baseEmail
  let suffix = 1
  while (await prisma.user.findUnique({ where: { email } })) {
    suffix += 1
    email = `reader_account_${suffix}@sageto.com`
  }

  const password = 'Reader@123456'
  const password_hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      role_id: readerRole.id,
      status: 'ACTIVE',
    },
  })

  const reader = await prisma.readerInfo.create({
    data: {
      user_id: user.id,
      display_name: 'Reader Account',
      description: 'Auto-created reader account',
      experience_year: 1,
      price_per_session: 10,
      rating: new Prisma.Decimal('4.5'),
      verified: true,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      specialty: ['Tarot'],
    },
  })

  console.log('Reader account created successfully:')
  console.log(`email: ${email}`)
  console.log(`password: ${password}`)
  console.log(`userId: ${user.id}`)
  console.log(`readerInfoId: ${reader.id}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
