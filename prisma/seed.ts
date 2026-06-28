import 'dotenv/config'
import { PrismaClient, Prisma } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readers, tarotCards, faqData, platformStats, testimonials } from '../lib/data'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is not defined in the environment')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

async function main() {
  console.log('Start seeding...')

  // 1. Roles
  for (const roleName of ['CUSTOMER', 'READER', 'ADMIN']) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `${roleName} role` },
    })
  }
  const readerRole = await prisma.role.findUniqueOrThrow({ where: { name: 'READER' } })

  // 2. Readers
  for (const reader of readers) {
    const email = `reader_${reader.id}@zenvy.com`
    const expYear = parseInt(reader.experience.match(/\d+/)?.[0] ?? '0', 10)

    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password_hash: '$2b$10$placeholder_hash_for_demo_reader',
        role_id: readerRole.id,
        status: 'ACTIVE',
      },
    })

    // Upsert reader info
    const readerInfo = await prisma.readerInfo.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        display_name: reader.name,
        description: reader.fullBio,
        experience_year: expYear,
        price_per_session: new Prisma.Decimal(reader.pricePerSession.toString()),
        rating: new Prisma.Decimal(reader.rating.toString()),
        verified: reader.isVerified,
        avatar_url: reader.avatar,
      },
      update: {
        display_name: reader.name,
        description: reader.fullBio,
        experience_year: expYear,
        price_per_session: new Prisma.Decimal(reader.pricePerSession.toString()),
        rating: new Prisma.Decimal(reader.rating.toString()),
        verified: reader.isVerified,
        avatar_url: reader.avatar,
      },
    })

    // Packages — bỏ id string, để DB tự tạo
    for (const { id: _id, ...pkg } of reader.packages) {
      await prisma.package.create({
        data: { ...pkg, reader_id: readerInfo.id },
      })
    }

    // Reviews — bỏ id string + userId không có trong schema
    for (const { id: _id, userId: _uid, ...review } of reader.reviews) {
      await prisma.review.create({
        data: {
          ...review,
          date: new Date(review.date),
          reader_id: readerInfo.id,
        },
      })
    }

    // Availability
    for (const avail of reader.availability) {
      await prisma.availability.create({
        data: {
          date: new Date(avail.date),
          slots: avail.slots,
          reader_id: readerInfo.id,
        },
      })
    }

    console.log(`✓ Reader: ${reader.name}`)
  }

  // 3. Tarot Cards
  await prisma.tarotCard.createMany({
    data: tarotCards.map(({ id: _id, ...card }) => card),
    skipDuplicates: true,
  })
  console.log('✓ Tarot Cards')

  // 4. FAQs
  await prisma.fAQ.createMany({
    data: faqData,
    skipDuplicates: true,
  })
  console.log('✓ FAQs')

  // 5. Platform Stats
  const existing = await prisma.platformStat.findFirst()
  if (!existing) {
    await prisma.platformStat.create({
      data: {
        totalSessions: platformStats.totalSessions,
        averageRating: new Prisma.Decimal(platformStats.averageRating.toString()),
        verifiedReaders: platformStats.verifiedReaders,
        avgResponseTime: platformStats.avgResponseTime,
        satisfactionRate: platformStats.satisfactionRate,
        onlineReaders: platformStats.onlineReaders,
      },
    })
    console.log('✓ Platform Stats')
  }

  // 6. Testimonials
  await prisma.testimonial.createMany({
    data: testimonials.map(({ id: _id, ...t }) => t),
    skipDuplicates: true,
  })
  console.log('✓ Testimonials')

  console.log('\n🌙 Seeding finished.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
