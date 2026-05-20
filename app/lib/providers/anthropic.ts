import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, Message, ProviderConfig, StreamChunk } from './types'

let _client: Anthropic | null = null

function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export const anthropicProvider: AIProvider = {
  name: 'anthropic',

  async chat(messages: Message[], config: ProviderConfig): Promise<string> {
    const client = getClient()
    const response = await client.messages.create({
      model: config.model,
      max_tokens: config.maxTokens ?? 4096,
      system: config.systemPrompt,
      messages: messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    })

    const block = response.content[0]
    return block.type === 'text' ? block.text : ''
  },

  async stream(messages: Message[], config: ProviderConfig, onChunk: (chunk: StreamChunk) => void): Promise<void> {
    const client = getClient()
    const stream = client.messages.stream({
      model: config.model,
      max_tokens: config.maxTokens ?? 4096,
      system: config.systemPrompt,
      messages: messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        onChunk({ text: event.delta.text, done: false })
      }
      if (event.type === 'message_stop') {
        onChunk({ text: '', done: true })
      }
    }
  },
}
