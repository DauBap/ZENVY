import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
})

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI chưa được cấu hình.' }, { status: 503 })
    }

    const { question, cards, spread } = await req.json()

    if (!question?.trim() || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Thiếu dữ liệu.' }, { status: 400 })
    }

    // Build card context
    const cardDescriptions = cards
      .map((card: { name: string; meaning: string }, i: number) => {
        const position =
          spread === 'three'
            ? ['Quá khứ', 'Hiện tại', 'Tương lai'][i] ?? `Lá ${i + 1}`
            : `Lá ${i + 1}`
        return `- ${position}: **${card.name}** — ${card.meaning}`
      })
      .join('\n')

    const systemPrompt = `Bạn là một Tarot Reader huyền bí, sâu sắc và đồng cảm. 
Bạn diễn giải bài Tarot bằng tiếng Việt, văn phong thơ mộng nhưng rõ ràng và có chiều sâu.
Diễn giải phải cá nhân hóa theo câu hỏi của người hỏi, không quá chung chung.
Tối đa 300 từ. Kết thúc bằng một lời khuyên ngắn gọn.`

    const userPrompt = `Câu hỏi: "${question}"

Các lá bài đã rút:
${cardDescriptions}

Hãy diễn giải tổng thể ý nghĩa của trải bài này liên quan đến câu hỏi trên.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 600,
      temperature: 0.85,
    })

    const interpretation = completion.choices[0]?.message?.content ?? 'Không có kết quả.'

    return NextResponse.json({ interpretation })
  } catch (e: any) {
    console.error('AI Tarot error:', e)
    if (e?.status === 401) {
      return NextResponse.json({ error: 'API key không hợp lệ.' }, { status: 503 })
    }
    if (e?.status === 429) {
      return NextResponse.json({ error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Lỗi AI. Vui lòng thử lại.' }, { status: 500 })
  }
}
