/**
 * Vision API Route
 * POST /api/vision - Analyze food images using Google Gemini
 * Supports: identifying dishes, analyzing fridge contents for ingredients
 * Uses Google Gemini for all vision analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

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
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[Vision API] Missing GEMINI_API_KEY')
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 })
    }

    const body = await req.json() as VisionRequest
    if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
      return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
    }

    const mode = body.mode || 'dish'
    console.log('[Vision API] Analyzing image in mode:', mode)

    // Initialize the Google GenAI client
    const client = new GoogleGenAI({ apiKey })

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

    // Use Gemini 2.0 Flash for vision tasks (supports multimodal input)
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { text: userMessage },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: body.imageBase64,
              },
            },
          ],
        },
      ],
    })

    // Extract text from response
    const candidates = response.candidates
    if (!candidates || candidates.length === 0) {
      console.error('[Vision API] No candidates in response')
      return NextResponse.json({ error: 'No response from vision model' }, { status: 500 })
    }

    const parts = candidates[0].content?.parts
    if (!parts || parts.length === 0) {
      console.error('[Vision API] No parts in response')
      return NextResponse.json({ error: 'Empty response from vision model' }, { status: 500 })
    }

    // Find text part
    let content = ''
    for (const part of parts) {
      if (part.text) {
        content = part.text
        break
      }
    }

    if (!content) {
      console.error('[Vision API] No text content in response')
      return NextResponse.json({ error: 'No text in vision response' }, { status: 500 })
    }

    console.log('[Vision API] Raw response:', content.substring(0, 200))

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

    console.log('[Vision API] Parsed result:', { name, ingredientCount: ingredients.length })
    return NextResponse.json({ name, summary, ingredients })
  } catch (error) {
    console.error('[Vision API] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to analyze image: ${message}` }, { status: 500 })
  }
}
