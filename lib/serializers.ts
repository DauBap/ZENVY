import type {
  Availability,
  FAQ,
  Package,
  PlatformStat,
  Prisma,
  ReaderInfo,
  Review,
  TarotCard,
  Testimonial,
} from '@prisma/client'

export type SerializedPackage = Package
export type SerializedReview = Omit<Review, 'date'> & { date: string }
export type SerializedAvailability = Omit<Availability, 'date'> & { date: string }
export type SerializedReader = Omit<ReaderInfo, 'rating' | 'price_per_session'> & {
  rating: number
  price_per_session: number
  // Aliased fields for UI compatibility
  name: string
  avatar: string
  specialty: string[]
  bio: string
  isOnline: boolean
  isVerified: boolean
  totalSessions: number
  responseTime: string
  pricePerSession: number
  packages?: SerializedPackage[]
  reviews?: SerializedReview[]
  availability?: SerializedAvailability[]
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
    reviews?: Review[]
    availability?: Availability[]
  }
): SerializedReader {
  const pricePerSession = toNumber(reader.price_per_session)
  return {
    ...reader,
    rating: toNumber(reader.rating),
    price_per_session: pricePerSession,
    // Map DB fields → UI field names
    name: reader.display_name ?? 'Tarot Reader',
    avatar: reader.avatar_url ?? '/placeholder-user.jpg',
    specialty: reader.specialty ?? [],
    bio: reader.description ?? '',
    isOnline: false,
    isVerified: reader.verified,
    totalSessions: 0,
    responseTime: '< 5 phút',
    pricePerSession,
    packages: reader.packages?.map((pkg) => ({ ...pkg })),
    reviews: reader.reviews?.map((review) => ({
      ...review,
      date: review.date.toISOString(),
    })),
    availability: reader.availability?.map((availability) => ({
      ...availability,
      date: availability.date.toISOString(),
    })),
  }
}

export function serializeReaders(
  readers: Array<
    ReaderInfo & {
      packages?: Package[]
      reviews?: Review[]
      availability?: Availability[]
    }
  >
): SerializedReader[] {
  return readers.map(serializeReader)
}

export function serializePlatformStat(stat: PlatformStat): SerializedPlatformStat {
  return {
    ...stat,
    averageRating: toNumber(stat.averageRating),
  }
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
