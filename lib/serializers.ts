import type {
  Availability,
  FAQ,
  Package,
  PlatformStat,
  Prisma,
  ReaderInfo,
  TarotCard,
  Testimonial,
} from '@prisma/client'
import { isReaderOnline } from '@/lib/online'

export type SerializedPackage = Package
export type SerializedAvailability = Omit<Availability, 'date'> & { date: string }
export type SerializedReader = Omit<ReaderInfo, 'rating' | 'price_per_session' | 'balance'> & {
  rating: number
  price_per_session: number
  balance: number
  // Aliased fields for UI compatibility
  name: string
  avatar: string
  specialty: string[]
  bio: string
  isOnline: boolean
  isVerified: boolean
  totalSessions: number
  reviewCount: number
  responseTime: string
  pricePerSession: number
  packages?: SerializedPackage[]
  availability?: SerializedAvailability[]
  voiceSample?: string | null
}
export type SerializedTarotCard = TarotCard
export type SerializedTestimonial = Testimonial
export type SerializedFAQ = FAQ
export type SerializedPlatformStat = Omit<PlatformStat, 'averageRating'> & {
  averageRating: number
}

const toNumber = (value: Prisma.Decimal | number | string): number => Number(value)

export function serializeReader(
  reader: ReaderInfo & {
    packages?: Package[]
    availability?: Availability[]
    _count?: { reviews?: number; session_reviews?: number }
  }
): SerializedReader {
  const pricePerSession = toNumber(reader.price_per_session)
  const reviewCount = (reader._count?.reviews ?? 0) + (reader._count?.session_reviews ?? 0)

  return {
    ...reader,
    rating: toNumber(reader.rating),
    price_per_session: pricePerSession,
    balance: toNumber(reader.balance),
    name: reader.display_name ?? 'Tarot Reader',
    avatar: reader.avatar_url ?? '/placeholder-user.jpg',
    specialty: reader.specialty ?? [],
    bio: reader.description ?? '',
    isOnline: isReaderOnline(reader.last_seen_at),
    isVerified: reader.verified,
    totalSessions: 0,
    reviewCount,
    responseTime: '< 5 phút',
    pricePerSession,
    packages: reader.packages?.map((pkg) => ({ ...pkg })),
    availability: reader.availability?.map((a) => ({
      ...a,
      date: a.date.toISOString(),
    })),
    // voice_sample may not exist in schema in all environments; read dynamically
    voiceSample: (reader as any).voice_sample ?? null,
  }
}

export function serializeReaders(
  readers: Array<
    ReaderInfo & {
      packages?: Package[]
      availability?: Availability[]
      _count?: { reviews?: number; session_reviews?: number }
    }
  >
): SerializedReader[] {
  return readers.map(serializeReader)
}

export function serializePlatformStat(stat: PlatformStat): SerializedPlatformStat {
  return { ...stat, averageRating: toNumber(stat.averageRating) }
}

export function serializeTarotCards(cards: TarotCard[]): SerializedTarotCard[] {
  return cards.map((card) => ({ ...card }))
}

export function serializeTestimonials(testimonials: Testimonial[]): SerializedTestimonial[] {
  return testimonials.map((item) => ({ ...item }))
}

export function serializeFAQ(faqs: FAQ[]): SerializedFAQ[] {
  return faqs.map((faq) => ({ ...faq }))
}
