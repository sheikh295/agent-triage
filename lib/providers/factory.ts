import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import type { LLMProvider } from '@/types';

export function createProviderModel(provider: LLMProvider, model: string) {
  switch (provider) {
    case 'openai': {
      const apiKey = process.env.OPENAI_API_KEY;
      const client = createOpenAI({ apiKey });
      return client(model);
    }
    case 'anthropic': {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      const client = createAnthropic({ apiKey });
      return client(model);
    }
    case 'google': {
      const apiKey = process.env.GOOGLE_API_KEY;
      const client = createGoogleGenerativeAI({ apiKey });
      return client(model);
    }
    case 'deepseek': {
      // DeepSeek is OpenAI-compatible
      const client = createOpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1',
      });
      return client(model);
    }
    case 'groq': {
      const client = createOpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      return client(model);
    }
    case 'ollama': {
      const client = createOpenAI({
        apiKey: 'ollama',
        baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
      });
      return client(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function getAvailableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.GOOGLE_API_KEY) providers.push('google');
  if (process.env.DEEPSEEK_API_KEY) providers.push('deepseek');
  if (process.env.GROQ_API_KEY) providers.push('groq');
  if (process.env.OLLAMA_BASE_URL) providers.push('ollama');
  return providers;
}

export function getFallbackProvider(): { provider: LLMProvider; model: string } | null {
  if (process.env.OPENAI_API_KEY) return { provider: 'openai', model: 'gpt-4o-mini' };
  if (process.env.ANTHROPIC_API_KEY) return { provider: 'anthropic', model: 'claude-3-haiku-20240307' };
  if (process.env.GOOGLE_API_KEY) return { provider: 'google', model: 'gemini-1.5-flash' };
  return null;
}
