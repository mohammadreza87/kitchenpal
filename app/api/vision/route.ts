import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

type VisionRequest = {
  imageBase64: string
  description?: string
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 })
    }

    const body = await req.json() as VisionRequest
    if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const prompt = `
You are a culinary vision assistant. Given a food photo, identify:
- The most likely dish name (or main ingredient if not a full dish).
- A concise one-sentence description.
Respond as JSON with keys: name, summary.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: body.description ?? 'Identify this food and describe it.' },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${body.imageBase64}` },
            },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 200,
    })

    let content = response.choices[0]?.message?.content ?? ''

    // Strip markdown code block formatting if present (```json ... ```)
    content = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    // Try to parse JSON; fallback to plain text
    let name = 'Unknown dish'
    let summary = content
    try {
      const parsed = JSON.parse(content)
      if (parsed.name) name = parsed.name
      if (parsed.summary) summary = parsed.summary
    } catch {
      // content was not JSON; try to extract first line as name
      const firstLine = content.split('\n')[0] || content
      name = firstLine.trim() || name
    }

    return NextResponse.json({ name, summary })
  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
