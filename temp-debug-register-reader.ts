process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db?sslmode=disable'

import('./app/api/auth/register-reader/route.ts')
  .then((mod) => {
    console.log('loaded route', typeof mod.POST)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
