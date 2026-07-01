process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db?sslmode=disable'

const mockRequest = {
  json: async () => ({
    name: 'Test Reader',
    email: 'test-reader@example.com',
    password: 'password123',
    facebookLink: 'https://facebook.com/testreader',
    phone: '0901234567',
    description: 'Test description for reader with enough length.',
    experienceYear: 2,
    specialty: 'Tarot',
    avatarDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P4z8DwHwAFggJ/lQZpAAAAAElFTkSuQmCC',
  }),
}

async function run() {
  try {
    const route = await import('./app/api/auth/register-reader/route.ts')
    const response = await route.POST(mockRequest as any)
    console.log('response', response)
    if (response && typeof response.json === 'function') {
      const body = await response.json()
      console.log('response body', body)
    }
  } catch (error) {
    console.error('route threw', error)
  }
}

run()
