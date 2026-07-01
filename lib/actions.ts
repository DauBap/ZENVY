'use server'

import { prisma } from '@/lib/prisma'
import {
  serializeReaders,
  serializeTarotCards,
  serializeFAQ,
} from '@/lib/serializers'

export async function getReaders(options: {
  include?: { packages?: boolean; reviews?: boolean; availability?: boolean }
  isOnline?: boolean
  limit?: number
} = {}) {
  try {
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
    if (readers.length > 0) return serializeReaders(readers)
  } catch (error) {
    console.error('getReaders failed:', error)
  }
  return []
}

export async function getTarotCards() {
  try {
    const cards = await prisma.tarotCard.findMany()
    if (cards.length > 0) return serializeTarotCards(cards)
  } catch (error) {
    console.error('getTarotCards failed:', error)
  }
  return []
}

export async function getFAQs() {
  try {
    const faqs = await prisma.fAQ.findMany()
    if (faqs.length > 0) return serializeFAQ(faqs)
  } catch (error) {
    console.error('getFAQs failed:', error)
  }
  return []
}