/**
 * Vision API Route
 * POST /api/vision - Analyze food images using Google Gemini
 * Supports: identifying dishes, analyzing fridge contents for ingredients
 * Uses Google Gemini for all vision analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

type VisionRequest = {
  imageBase64: string
  description?: string
  mode?: 'dish' | 'ingredients' // 'dish' = identify a dish, 'ingredients' = identify fridge contents
}

type VisionResponse = {
  name?: string
  summary?: string
  ingredients?: string[]
  error?: string
}

export async function POST(req: NextRequest): Promise<NextResponse<VisionResponse>> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 })
    }

    const body = await req.json() as VisionRequest
    if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const mode = body.mode || 'dish'
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Different prompts based on mode
    let prompt: string
    if (mode === 'ingredients') {
      prompt = `You are a culinary vision assistant helping users find recipes based on what's in their fridge.

Analyze this image of food items/ingredients and:
1. List all the ingredients you can identify
2. Be specific about quantities if visible (e.g., "3 eggs", "1 onion")
3. Include any condiments, sauces, or packaged items you see

Respond ONLY as JSON with this exact format:
{
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "summary": "Brief description of what you see"
}

Be thorough - identify everything that could be used in cooking.`
    } else {
      prompt = `You are a culinary vision assistant. Given a food photo, identify:
- The most likely dish name (or main ingredient if not a full dish).
- A concise one-sentence description.
- Key ingredients you can identify in the dish.

Respond ONLY as JSON with this exact format:
{
  "name": "dish name",
  "summary": "brief description",
  "ingredients": ["ingredient1", "ingredient2", ...]
}`
    }

    const userMessage = body.description
      ? `${body.description}\n\nAnalyze this image:`
      : mode === 'ingredients'
        ? 'Identify all the ingredients in this fridge/kitchen image:'
        : 'Identify this food and describe it:'

    const response = await model.generateContent([
      prompt,
      userMessage,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: body.imageBase64,
        },
      },
    ])

    let content = response.response.text()

    // Strip markdown code block formatting if present
    content = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    // Parse JSON response
    let name = 'Unknown dish'
    let summary = content
    let ingredients: string[] = []

    try {
      const parsed = JSON.parse(content)
      if (parsed.name) name = parsed.name
      if (parsed.summary) summary = parsed.summary
      if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
        ingredients = parsed.ingredients
      }
    } catch {
      // content was not JSON; try to extract first line as name
      const firstLine = content.split('\n')[0] || content
      name = firstLine.trim() || name
    }

    return NextResponse.json({ name, summary, ingredients })
  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
