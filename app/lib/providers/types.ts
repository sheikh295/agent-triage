export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface StreamChunk {
  text: string
  done: boolean
}

export interface ProviderConfig {
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIProvider {
  name: string
  chat(messages: Message[], config: ProviderConfig): Promise<string>
  stream(messages: Message[], config: ProviderConfig, onChunk: (chunk: StreamChunk) => void): Promise<void>
}
