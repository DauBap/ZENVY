import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is not defined')

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
})

async function main() {
  console.log('🌱 Bắt đầu seed tài khoản demo ZENVY...\n')

  const SALT = 10

  // ── 1. Upsert Roles ─────────────────────────────────────────────────────────
  const [adminRole, customerRole, readerRole] = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' },    update: {}, create: { name: 'ADMIN',    description: 'Administrator' } }),
    prisma.role.upsert({ where: { name: 'CUSTOMER' }, update: {}, create: { name: 'CUSTOMER', description: 'Customer role' } }),
    prisma.role.upsert({ where: { name: 'READER' },   update: {}, create: { name: 'READER',   description: 'Reader role'   } }),
  ])
  console.log('✅ Roles đã sẵn sàng')

  // ── 2. Admin ─────────────────────────────────────────────────────────────────
  const adminEmail    = 'admin@zenvy.vn'
  const adminPassword = 'Admin@123'

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existingAdmin) {
    console.log(`⚠️  Admin (${adminEmail}) đã tồn tại — bỏ qua`)
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password_hash: await bcrypt.hash(adminPassword, SALT),
        role_id: adminRole.id,
        status: 'ACTIVE',
      },
    })
    console.log(`✅ Admin tạo thành công: ${adminEmail}`)
  }

  // ── 3. Customer ──────────────────────────────────────────────────────────────
  const customerEmail    = 'customer@zenvy.vn'
  const customerPassword = 'Customer@123'

  const existingCustomer = await prisma.user.findUnique({ where: { email: customerEmail } })
  if (existingCustomer) {
    console.log(`⚠️  Customer (${customerEmail}) đã tồn tại — bỏ qua`)
  } else {
    await prisma.user.create({
      data: {
        email: customerEmail,
        password_hash: await bcrypt.hash(customerPassword, SALT),
        role_id: customerRole.id,
        status: 'ACTIVE',
        customer_info: {
          create: {
            fullname: 'Nguyễn Văn Demo',
          },
        },
      },
    })
    console.log(`✅ Customer tạo thành công: ${customerEmail}`)
  }

  // ── 4. Reader ─────────────────────────────────────────────────────────────────
  const readerEmail    = 'reader@zenvy.vn'
  const readerPassword = 'Reader@123'

  const existingReader = await prisma.user.findUnique({ where: { email: readerEmail } })
  if (existingReader) {
    console.log(`⚠️  Reader (${readerEmail}) đã tồn tại — bỏ qua`)
  } else {
    await prisma.user.create({
      data: {
        email: readerEmail,
        password_hash: await bcrypt.hash(readerPassword, SALT),
        role_id: readerRole.id,
        status: 'ACTIVE',
        reader_info: {
          create: {
            display_name:    'Luna Mystique (Demo)',
            description:     'Reader Tarot demo với hơn 5 năm kinh nghiệm. Chuyên giải bài tình cảm, sự nghiệp và tâm linh.',
            experience_year: 5,
            specialty:       ['Tình cảm', 'Sự nghiệp', 'Tâm linh'],
            avatar_url:      '/placeholder-user.jpg',
            facebook_link:   'https://facebook.com/zenvy.demo',
            verified:        true,
            price_per_session: 150000,
            rating:          4.8,
          },
        },
      },
      include: { reader_info: true },
    })
    console.log(`✅ Reader tạo thành công: ${readerEmail}`)
  }

  // ── 5. Thêm Package demo cho Reader ──────────────────────────────────────────
  const readerUser = await prisma.user.findUnique({
    where: { email: readerEmail },
    include: { reader_info: true },
  })

  if (readerUser?.reader_info) {
    const existingPkgs = await prisma.package.count({ where: { reader_id: readerUser.reader_info.id } })
    if (existingPkgs === 0) {
      await prisma.package.createMany({
        data: [
          { reader_id: readerUser.reader_info.id, name: 'Bói 1 lá',           duration: 30, price: 100000, description: 'Giải đáp 1 câu hỏi nhanh trong 30 phút.',                             popular: false },
          { reader_id: readerUser.reader_info.id, name: 'Trải bài Celtic Cross', duration: 60, price: 200000, description: 'Trải bài 10 lá toàn diện — tình cảm, sự nghiệp, tài chính.', popular: true  },
          { reader_id: readerUser.reader_info.id, name: 'Phiên VIP',          duration: 90, price: 350000, description: 'Phiên cao cấp 90 phút, bao gồm cả giải bài và tư vấn chuyên sâu.',  popular: false },
        ],
      })
      console.log('✅ Packages demo đã được tạo cho Reader')
    } else {
      console.log('⚠️  Packages đã tồn tại — bỏ qua')
    }
  }

  console.log('\n🎉 Seed hoàn tất!\n')
  console.log('─────────────────────────────────────────────')
  console.log('  Vai trò   │ Email                │ Mật khẩu    ')
  console.log('─────────────────────────────────────────────')
  console.log('  ADMIN     │ admin@zenvy.vn        │ Admin@123   ')
  console.log('  CUSTOMER  │ customer@zenvy.vn     │ Customer@123')
  console.log('  READER    │ reader@zenvy.vn       │ Reader@123  ')
  console.log('─────────────────────────────────────────────\n')
}

main()
  .catch((e) => { console.error('❌ Seed thất bại:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
