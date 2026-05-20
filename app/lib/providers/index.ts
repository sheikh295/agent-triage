import { openaiProvider } from './openai'
import { anthropicProvider } from './anthropic'
import { xaiProvider } from './xai'
import type { AIProvider } from './types'

const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  xai: xaiProvider,
}

export function getProvider(name: string): AIProvider {
  const provider = providers[name]
  if (!provider) throw new Error(`Unknown provider: ${name}`)
  return provider
}

export { openaiProvider, anthropicProvider, xaiProvider }
export type { AIProvider }
