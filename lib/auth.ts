import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'sageto-fallback-secret'
)

const COOKIE_NAME = 'sageto_token'
const EXPIRES_IN = 7 * 24 * 60 * 60 // 7 ngày (giây)

export interface JWTPayload {
  sub: string       // user id
  email: string
  role: string
  name: string
  tokenVersion?: number  // bump để invalidate JWT cũ sau khi đổi/reset password
}

// ── Ký token ─────────────────────────────────────────────────────────────────
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_IN}s`)
    .sign(SECRET)
}

// ── Verify token (chỉ kiểm chữ ký + hạn, KHÔNG check DB) ───────────────────────
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

// ── Đọc session từ cookie (Server Component / Route Handler) ──────────────────
// Verify chữ ký + KHỚP token_version với DB → JWT cũ bị invalidate ngay khi
// user đổi/reset password (token_version bump). Trả null nếu lệch version.
export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null

  // Token cũ (trước khi có token_version) không mang field này → vẫn cho phép
  // để không phá vỡ session hiện có. Chỉ enforce khi token có tokenVersion.
  if (payload.tokenVersion === undefined) return payload

  const user = await prisma.user.findUnique({
    where: { id: Number(payload.sub) },
    select: { token_version: true, status: true },
  })
  if (!user || user.status !== 'ACTIVE') return null
  if (user.token_version !== payload.tokenVersion) return null
  return payload
}

// ── Cookie options ────────────────────────────────────────────────────────────
export const cookieOptions = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: EXPIRES_IN,
}
