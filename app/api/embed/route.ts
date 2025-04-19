import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: Request) {
  const { chunk } = await req.json() // changed from `text` to `chunk`

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: chunk,
  })

  return NextResponse.json({ embedding: response.data[0].embedding })
}
