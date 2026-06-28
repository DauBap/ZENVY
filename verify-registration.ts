import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
})

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@zenvy.com' },
      include: { customer_info: true, role: true },
    })
    
    console.log('\n✅ User found in database:')
    console.log(JSON.stringify(user, null, 2))
  } catch (error) {
    console.error('❌ Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
