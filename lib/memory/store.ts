import type { Message, Conversation } from '@/types';

// In-memory conversation store (production would use PostgreSQL)
// This is a server-side singleton for the current session
const conversationStore = new Map<string, Conversation>();

export function getConversation(id: string): Conversation | null {
  return conversationStore.get(id) ?? null;
}

export function createConversation(id: string, initialAgentId = 'general'): Conversation {
  const conversation: Conversation = {
    id,
    title: 'New Conversation',
    messages: [],
    activeAgentId: initialAgentId,
    participants: [initialAgentId],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  conversationStore.set(id, conversation);
  return conversation;
}

export function getOrCreateConversation(id: string): Conversation {
  return getConversation(id) ?? createConversation(id);
}

export function addMessage(conversationId: string, message: Message): void {
  const conversation = getOrCreateConversation(conversationId);
  conversation.messages.push(message);
  conversation.updatedAt = new Date();

  // Track participating agents
  if (message.agentId && !conversation.participants.includes(message.agentId)) {
    conversation.participants.push(message.agentId);
  }

  // Auto-generate title from first user message
  if (conversation.messages.filter(m => m.role === 'user').length === 1) {
    const firstMsg = message.content.slice(0, 60);
    conversation.title = firstMsg.length === 60 ? firstMsg + '...' : firstMsg;
  }

  conversationStore.set(conversationId, conversation);
}

export function updateActiveAgent(conversationId: string, agentId: string): void {
  const conversation = getOrCreateConversation(conversationId);
  conversation.activeAgentId = agentId;
  conversationStore.set(conversationId, conversation);
}

export function getAllConversations(): Conversation[] {
  return Array.from(conversationStore.values()).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

export function deleteConversation(id: string): boolean {
  return conversationStore.delete(id);
}

/**
 * Get the last N messages formatted for LLM context.
 */
export function getContextMessages(conversationId: string, limit = 20): Message[] {
  const conversation = getConversation(conversationId);
  if (!conversation) return [];
  return conversation.messages
    .filter(m => m.role !== 'system' && m.status !== 'error')
    .slice(-limit);
}
