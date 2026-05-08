const { PrismaClient } = require('@prisma/client')

const p = new PrismaClient()

async function main() {
  try {
    await p.user.create({ data: { name: 'Zenvy Test', email: 'test+zenvy@example.com' } })
    const u = await p.user.findMany()
    console.log(JSON.stringify(u, null, 2))
  } catch (e) {
    console.error('ERROR:', e)
    process.exit(1)
  } finally {
    await p.$disconnect()
  }
}

main()

