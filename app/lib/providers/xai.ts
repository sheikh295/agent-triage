// xAI Grok uses OpenAI-compatible API
import OpenAI from 'openai'
import type { AIProvider, Message, ProviderConfig, StreamChunk } from './types'

let _client: OpenAI | null = null

function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.XAI_API_KEY,
      baseURL: 'https://api.x.ai/v1',
    })
  }
  return _client
}

export const xaiProvider: AIProvider = {
  name: 'xai',

  async chat(messages: Message[], config: ProviderConfig): Promise<string> {
    const client = getClient()
    const systemMessages = config.systemPrompt
      ? [{ role: 'system' as const, content: config.systemPrompt }]
      : []

    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        ...systemMessages,
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      ],
      temperature: config.temperature ?? 0.7,
    })

    return response.choices[0]?.message?.content ?? ''
  },

  async stream(messages: Message[], config: ProviderConfig, onChunk: (chunk: StreamChunk) => void): Promise<void> {
    const client = getClient()
    const systemMessages = config.systemPrompt
      ? [{ role: 'system' as const, content: config.systemPrompt }]
      : []

    const stream = await client.chat.completions.create({
      model: config.model,
      messages: [
        ...systemMessages,
        ...messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
      ],
      temperature: config.temperature ?? 0.7,
      stream: true,
    })

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content ?? ''
      const done = chunk.choices[0]?.finish_reason === 'stop'
      if (text) onChunk({ text, done: false })
      if (done) onChunk({ text: '', done: true })
    }
  },
}
