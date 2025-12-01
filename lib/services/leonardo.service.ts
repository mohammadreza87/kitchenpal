import { leonardoEnv, validateLeonardoEnv } from '@/lib/env'
import { buildImagePrompt } from './prompt-builder'
import { createImageError, type GeneratedImage } from './image.service'

export interface LeonardoServiceConfig {
  apiKey: string
  baseUrl: string
  modelId?: string
  imageSize?: string
}

interface LeonardoGenerationJob {
  generationId: string
}

interface LeonardoCreateResponse {
  sdGenerationJob?: LeonardoGenerationJob
}

interface LeonardoImage {
  url?: string
  mimeType?: string
  base64?: string
}

interface LeonardoGetResponse {
  generations_by_pk?: {
    status?: string
    generated_images?: Array<{ url?: string }>
  }
}

export class LeonardoService {
  private config: LeonardoServiceConfig

  constructor(config?: Partial<LeonardoServiceConfig>) {
    validateLeonardoEnv()

    this.config = {
      apiKey: config?.apiKey || leonardoEnv.LEONARDO_API_KEY,
      baseUrl: config?.baseUrl || leonardoEnv.LEONARDO_BASE_URL,
      modelId: config?.modelId || leonardoEnv.LEONARDO_MODEL_ID || undefined,
      imageSize: config?.imageSize || leonardoEnv.LEONARDO_IMAGE_SIZE || '768x768',
    }
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Leonardo API error: ${res.status} ${text}`)
    }

    return res.json() as Promise<T>
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}${path}`, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Leonardo API error: ${res.status} ${text}`)
    }

    return res.json() as Promise<T>
  }

  private async pollGeneration(generationId: string, timeoutMs = 15000): Promise<LeonardoImage | null> {
    const start = Date.now()

    while (Date.now() - start < timeoutMs) {
      const data = await this.get<LeonardoGetResponse>(`/generations/${generationId}`)
      const status = data.generations_by_pk?.status
      const imageUrl = data.generations_by_pk?.generated_images?.[0]?.url

      if (status === 'COMPLETE' && imageUrl) {
        return { url: imageUrl, mimeType: 'image/png' }
      }

      if (status === 'FAILED') {
        throw new Error('Leonardo generation failed')
      }

      await new Promise(resolve => setTimeout(resolve, 750))
    }

    return null
  }

  async generateImage(prompt: string, description?: string): Promise<GeneratedImage> {
    try {
      const fullPrompt = buildImagePrompt(prompt, description)

      const createPayload: Record<string, unknown> = {
        prompt: fullPrompt,
        num_images: 1,
        width: parseInt(this.config.imageSize.split('x')[0] || '768', 10),
        height: parseInt(this.config.imageSize.split('x')[1] || '768', 10),
        promptMagic: true,
      }

      if (this.config.modelId) {
        createPayload.modelId = this.config.modelId
      }

      const createRes = await this.post<LeonardoCreateResponse>('/generations', createPayload)
      const generationId = createRes.sdGenerationJob?.generationId
      if (!generationId) {
        throw new Error('Leonardo generationId missing')
      }

      const image = await this.pollGeneration(generationId)

      if (image?.url) {
        return {
          base64Data: '',
          mimeType: (image.mimeType as GeneratedImage['mimeType']) || 'image/png',
          url: image.url,
        }
      }

      throw new Error('Leonardo generation timed out')
    } catch (error) {
      throw createImageError(error)
    }
  }
}

export function createLeonardoService(config?: Partial<LeonardoServiceConfig>): LeonardoService {
  return new LeonardoService(config)
}
