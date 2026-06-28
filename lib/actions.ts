'use server'

import { prisma } from '@/lib/prisma'
import {
  serializeReader,
  serializeReaders,
  serializeTarotCards,
  serializeTestimonials,
  serializeFAQ,
  serializePlatformStat,
} from '@/lib/serializers'

export async function getReaders(options: {
  include?: { packages?: boolean; reviews?: boolean; availability?: boolean }
  isOnline?: boolean
  limit?: number
} = {}) {
  const readers = await prisma.readerInfo.findMany({
    where: {
      user: { status: 'ACTIVE' },
    },
    include: {
      ...(options.include?.packages && { packages: true }),
      ...(options.include?.reviews && { reviews: true }),
      ...(options.include?.availability && { availability: true }),
    },
    take: options.limit,
  })
  return serializeReaders(readers)
}

export async function getTarotCards() {
  const cards = await prisma.tarotCard.findMany()
  return serializeTarotCards(cards)
}

export async function getFAQs() {
  const faqs = await prisma.fAQ.findMany()
  return serializeFAQ(faqs)
}