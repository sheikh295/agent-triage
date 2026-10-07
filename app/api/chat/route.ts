import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import type { Message } from '@/types';
import { triageMessage } from '@/lib/orchestration/triage';
import { getAgentById, getDefaultAgent } from '@/lib/agents/registry';
import { createProviderModel, getFallbackProvider } from '@/lib/providers/factory';
import { getOrCreateConversation, addMessage, updateActiveAgent, getContextMessages } from '@/lib/memory/store';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_CONTEXT_MESSAGES = 20;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message: userMessage, agentId: requestedAgentId } = body as {
      conversationId: string;
      message: string;
      agentId?: string;
    };

    if (!conversationId || !userMessage?.trim()) {
      return Response.json({ error: 'conversationId and message are required' }, { status: 400 });
    }

    // Get or create conversation
    const conversation = getOrCreateConversation(conversationId);

    // Add user message to store
    const userMsg: Message = {
      id: nanoid(),
      conversationId,
      role: 'user',
      content: userMessage,
      status: 'complete',
      timestamp: new Date(),
    };
    addMessage(conversationId, userMsg);

    // Triage: determine which agent should handle this
    let selectedAgent;
    if (requestedAgentId) {
      selectedAgent = getAgentById(requestedAgentId) ?? getDefaultAgent();
    } else {
      const triageResult = triageMessage({
        messages: conversation.messages,
        currentAgentId: conversation.activeAgentId,
        userMessage,
      });
      selectedAgent = getAgentById(triageResult.agentId) ?? getDefaultAgent();
    }

    const isHandoff = selectedAgent.id !== conversation.activeAgentId;
    const previousAgentId = isHandoff ? conversation.activeAgentId : undefined;

    // Update active agent
    updateActiveAgent(conversationId, selectedAgent.id);

    // Build messages for LLM
    const contextMessages = getContextMessages(conversationId, MAX_CONTEXT_MESSAGES);
    const llmMessages = contextMessages
      .filter(m => m.id !== userMsg.id) // exclude the message we just added
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // Add current user message
    llmMessages.push({ role: 'user', content: userMessage });

    // Get provider model (with fallback)
    let model;
    try {
      model = createProviderModel(selectedAgent.provider, selectedAgent.model);
    } catch {
      const fallback = getFallbackProvider();
      if (!fallback) {
        return Response.json(
          { error: 'No AI providers configured. Please set API keys in environment variables.' },
          { status: 503 }
        );
      }
      model = createProviderModel(fallback.provider, fallback.model);
    }

    // Stream the response
    const result = await streamText({
      model,
      system: selectedAgent.systemPrompt,
      messages: llmMessages,
      temperature: selectedAgent.temperature ?? 0.7,
      maxTokens: selectedAgent.maxTokens ?? 2048,
      onFinish: async ({ text, usage }) => {
        // Save assistant message to store
        const assistantMsg: Message = {
          id: nanoid(),
          conversationId,
          role: 'assistant',
          content: text,
          status: 'complete',
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          agentColor: selectedAgent.color,
          agentEmoji: selectedAgent.emoji,
          timestamp: new Date(),
          tokens: usage?.totalTokens,
          model: selectedAgent.model,
          provider: selectedAgent.provider,
          isHandoff,
          handoffFrom: previousAgentId,
          handoffTo: isHandoff ? selectedAgent.id : undefined,
        };
        addMessage(conversationId, assistantMsg);
      },
    });

    // Add custom headers for agent info.
    // NOTE: HTTP headers are Latin-1 (0-255) only — do NOT include emoji or other
    // multi-byte Unicode characters here. The client looks up the full agent (including
    // emoji) by ID from the local AGENTS registry, so the emoji header is unnecessary.
    const headers = new Headers({
      'X-Agent-Id': selectedAgent.id,
      'X-Agent-Name': selectedAgent.name,
      'X-Agent-Color': selectedAgent.color,
      'X-Is-Handoff': isHandoff ? 'true' : 'false',
      'X-Previous-Agent-Id': previousAgentId ?? '',
    });

    return result.toDataStreamResponse({ headers });
  } catch (error) {
    console.error('[chat/route] Error:', error);
    return Response.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
