export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  agentId?: string
  agentName?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  description: string
  specialty: string[]
  emoji: string
  color: string
}

export interface StreamEvent {
  type: 'conversation' | 'agent' | 'chunk' | 'done' | 'error'
  conversationId?: string
  agentId?: string
  agentName?: string
  reason?: string
  text?: string
  error?: string
}
