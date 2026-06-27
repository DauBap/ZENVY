import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readers, tarotCards, faqData, platformStats } from '../lib/data'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
})

async function main() {
  console.log('Start seeding...')

  // 1. Create Roles
  const roles = ['CUSTOMER', 'READER', 'ADMIN']
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} role`,
      },
    })
  }

  const readerRole = await prisma.role.findUnique({ where: { name: 'READER' } })
  if (!readerRole) throw new Error('READER role not found')

  // 2. Create Readers and related data
  for (const reader of readers) {
    const email = `reader_${reader.id}@zenvy.com`

    // Parse experience year (e.g., "8 năm" -> 8)
    const expMatch = reader.experience.match(/\d+/)
    const experienceYear = expMatch ? parseInt(expMatch[0], 10) : 0

    // Upsert User
    const user = await prisma.user.create({
      where: { email },
      data: {
        email,
        password_hash: 'hashed_password_demo', // In real app, use bcrypt
        role_id: readerRole.id,
        status: 'ACTIVE',
      },
      skipDuplicates: true,
    })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    const userId = existingUser!.id

    // Upsert ReaderInfo
    const readerInfo = await prisma.readerInfo.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        display_name: reader.name,
        description: reader.fullBio,
        experience_year: experienceYear,
        price_per_session: new Prisma.Decimal(reader.pricePerSession.toString()),
        rating: new Prisma.Decimal(reader.rating.toString()),
        verified: reader.isVerified,
        avatar_url: reader.avatar,
      },
      update: {
        display_name: reader.name,
        description: reader.fullBio,
        experience_year: experienceYear,
        price_per_session: new Prisma.Decimal(reader.pricePerSession.toString()),
        rating: new Prisma.Decimal(reader.rating.toString()),
        verified: reader.isVerified,
        avatar_url: reader.avatar,
      },
    })

    // Seed Packages
    for (const pkg of reader.packages) {
      await prisma.package.create({
        data: { ...pkg, reader_id: readerInfo.id },
        skipDuplicates: true,
      })
    }

    // Seed Reviews
    for (const review of reader.reviews) {
      await prisma.review.create({
        data: {
          ...review,
          date: new Date(review.date),
          reader_id: readerInfo.id,
        },
        skipDuplicates: true,
      })
    }

    // Seed Availability
    for (const avail of reader.availability) {
      await prisma.availability.create({
        data: {
          date: new Date(avail.date),
          slots: avail.slots,
          reader_id: readerInfo.id,
        },
        skipDuplicates: true,
      })
    }

    console.log(`Created reader: ${reader.name}`)
  }

  // 3. Seed Tarot Cards
  await prisma.tarotCard.createMany({
    data: tarotCards.map(({ id, ...card }) => card),
    skipDuplicates: true,
  })
  console.log('Seeded Tarot Cards.')

  // 4. Seed FAQs
  await prisma.fAQ.createMany({
    data: faqData,
    skipDuplicates: true,
  })
  console.log('Seeded FAQs.')

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })