// Message types
export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error';

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  agentId?: string;
  agentName?: string;
  agentColor?: string;
  agentEmoji?: string;
  timestamp: Date;
  tokens?: number;
  attachments?: Attachment[];
  isHandoff?: boolean;
  handoffFrom?: string;
  handoffTo?: string;
  reasoning?: string;
  model?: string;
  provider?: string;
}

// Agent types
export type AgentDomain =
  | 'general'
  | 'coding'
  | 'research'
  | 'architecture'
  | 'devops'
  | 'design'
  | 'summarize'
  | 'planning'
  | 'debugging'
  | 'legal'
  | 'data'
  | 'writing';

export type LLMProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'groq' | 'ollama';

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  color: string; // tailwind color like 'blue', 'violet', etc.
  colorHex: string; // hex color for backgrounds
  domain: AgentDomain;
  description: string;
  systemPrompt: string;
  provider: LLMProvider;
  model: string;
  tools?: AgentTool[];
  keywords: string[];
  capabilities: string[];
  temperature?: number;
  maxTokens?: number;
  active: boolean;
}

// Conversation types
export interface ConversationSummary {
  id: string;
  title: string;
  lastMessage: string;
  lastAgentId: string;
  lastAgentName: string;
  lastAgentEmoji: string;
  timestamp: Date;
  messageCount: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  activeAgentId: string;
  participants: string[]; // agent IDs that participated
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// Triage types
export interface TriageResult {
  agentId: string;
  agentName: string;
  confidence: number;
  reasoning: string;
  isHandoff: boolean;
  previousAgentId?: string;
}

// Provider config
export interface ProviderConfig {
  provider: LLMProvider;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

// Chat request/response
export interface ChatRequest {
  conversationId: string;
  message: string;
  agentId?: string; // override agent selection
  attachments?: Attachment[];
}

export interface StreamChunk {
  type: 'text' | 'agent_switch' | 'error' | 'done' | 'reasoning';
  content?: string;
  agentId?: string;
  agentName?: string;
  agentEmoji?: string;
  agentColor?: string;
  reasoning?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
