const fetch = globalThis.fetch || require('node-fetch')

async function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const url = 'http://localhost:3001/api/users'
  let ok = false
  let lastErr = ''
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) {
        console.log('GET ok', res.status)
        const data = await res.json()
        console.log(JSON.stringify(data, null, 2))
        ok = true
        break
      } else {
        lastErr = 'status:' + res.status
      }
    } catch (e) {
      lastErr = String(e)
    }
    await wait(500)
  }
  if (!ok) {
    console.error('GET failed after retries', lastErr)
    process.exit(2)
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'API Test', email: `api+${Date.now()}@example.com` })
    })
    const d = await res.json()
    console.log('POST result', res.status, JSON.stringify(d))
  } catch (e) {
    console.error('POST error', e)
    process.exit(3)
  }
}

main()
