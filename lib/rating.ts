import { prisma } from '@/lib/prisma'

// Tính lại reader_info.rating = trung bình cộng sao của reader đó
// (gộp cả review cũ ở bảng `reviews` và review phiên ở `session_reviews`).
// Trả về rating mới (đã làm tròn 1 chữ số thập phân).
export async function recomputeReaderRating(readerId: number): Promise<number> {
  const [legacy, session] = await Promise.all([
    prisma.review.aggregate({
      where: { reader_id: readerId },
      _sum: { rating: true },
      _count: true,
    }),
    prisma.sessionReview.aggregate({
      where: { reader_id: readerId },
      _sum: { rating: true },
      _count: true,
    }),
  ])

  const totalCount = legacy._count + session._count
  const totalSum = (legacy._sum.rating ?? 0) + (session._sum.rating ?? 0)
  const avg = totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : 0

  await prisma.readerInfo.update({
    where: { id: readerId },
    data: { rating: avg },
  })

  return avg
}
