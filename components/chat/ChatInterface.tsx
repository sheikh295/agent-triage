'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useChat } from 'ai/react';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { AgentBadge } from './AgentBadge';
import { ConversationSidebar } from './ConversationSidebar';
import { AgentRoster } from './AgentRoster';
import { useChatStore } from '@/store/chatStore';
import { AGENTS, getDefaultAgent } from '@/lib/agents/registry';
import type { Message } from '@/types';

export function ChatInterface() {
  const {
    activeConversationId,
    conversationMessages,
    activeAgent,
    isStreaming,
    streamingMessageId,
    createConversation,
    setActiveConversation,
    addMessage,
    updateMessage,
    setStreamingMessage,
    setActiveAgent,
    setIsStreaming,
    updateConversationSummary,
    sidebarOpen,
  } = useChatStore();

  // Ref to track the current streaming message ID across callbacks
  const streamingMsgRef = useRef<string | null>(null);

  // Initialize with a conversation on mount.
  // Only create a NEW conversation when there are genuinely no conversations yet.
  // If there are existing conversations but none is active (e.g. after a fresh page
  // load before the persisted activeConversationId is read), activate the most recent
  // one rather than spawning a blank duplicate.
  useEffect(() => {
    const state = useChatStore.getState();
    if (!state.activeConversationId) {
      if (state.conversations.length > 0) {
        // Restore the most-recently-updated conversation
        setActiveConversation(state.conversations[0].id);
      } else {
        createConversation();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set default agent if none is active
  useEffect(() => {
    if (!activeAgent) {
      setActiveAgent(getDefaultAgent());
    }
  }, [activeAgent, setActiveAgent]);

  const conversationId = activeConversationId ?? '';
  const messages = conversationMessages[conversationId] ?? [];

  const { append, stop, isLoading, messages: aiMessages } = useChat({
    api: '/api/chat',
    id: conversationId,
    // Transform the request body to match the API route's expected format
    experimental_prepareRequestBody: ({ messages: chatMessages }) => ({
      conversationId,
      message: chatMessages.at(-1)?.content ?? '',
    }),
    onResponse: (response) => {
      const agentId = response.headers.get('X-Agent-Id');
      const isHandoff = response.headers.get('X-Is-Handoff') === 'true';
      const previousAgentId = response.headers.get('X-Previous-Agent-Id') || undefined;

      let agent = activeAgent ?? getDefaultAgent();
      if (agentId) {
        const found = AGENTS.find(a => a.id === agentId);
        if (found) {
          agent = found;
          setActiveAgent(found);
        }
      }

      setIsStreaming(true);

      // Create a streaming placeholder message in our store
      const streamingId = nanoid();
      streamingMsgRef.current = streamingId;

      const streamingMsg: Message = {
        id: streamingId,
        conversationId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        agentId: agent.id,
        agentName: agent.name,
        agentColor: agent.color,
        agentEmoji: agent.emoji,
        timestamp: new Date(),
        isHandoff,
        handoffFrom: previousAgentId,
        handoffTo: isHandoff ? agent.id : undefined,
      };

      addMessage(conversationId, streamingMsg);
      setStreamingMessage(conversationId, streamingId, '');
    },
    onFinish: (message) => {
      setIsStreaming(false);

      const msgId = streamingMsgRef.current;
      if (msgId) {
        updateMessage(conversationId, msgId, {
          content: message.content,
          status: 'complete',
        });
        setStreamingMessage(conversationId, null);
        streamingMsgRef.current = null;
      }

      // Update conversation summary
      const currentState = useChatStore.getState();
      const agentForSummary = currentState.activeAgent ?? getDefaultAgent();
      const msgCount = (currentState.conversationMessages[conversationId] ?? []).length;

      updateConversationSummary({
        id: conversationId,
        lastMessage: message.content.slice(0, 100),
        lastAgentId: agentForSummary.id,
        lastAgentName: agentForSummary.name,
        lastAgentEmoji: agentForSummary.emoji,
        timestamp: new Date(),
        messageCount: msgCount,
      });
    },
    onError: () => {
      setIsStreaming(false);
      if (streamingMsgRef.current) {
        updateMessage(conversationId, streamingMsgRef.current, { status: 'error' });
        setStreamingMessage(conversationId, null);
        streamingMsgRef.current = null;
      }
    },
  });

  // Sync streaming content from useChat into our Zustand store
  useEffect(() => {
    if (!isLoading || !streamingMsgRef.current) return;
    const lastMsg = aiMessages.at(-1);
    if (!lastMsg || lastMsg.role !== 'assistant') return;
    updateMessage(conversationId, streamingMsgRef.current, { content: lastMsg.content });
  }, [aiMessages, isLoading, conversationId, updateMessage]);

  const handleSend = useCallback(async (content: string) => {
    if (!conversationId || isStreaming) return;

    // Add user message to our store immediately for instant UI feedback
    const userMsg: Message = {
      id: nanoid(),
      conversationId,
      role: 'user',
      content,
      status: 'complete',
      timestamp: new Date(),
    };
    addMessage(conversationId, userMsg);

    // Set conversation title from the first user message
    const currentMessages = useChatStore.getState().conversationMessages[conversationId] ?? [];
    if (currentMessages.filter(m => m.role === 'user').length === 1) {
      updateConversationSummary({
        id: conversationId,
        title: content.length > 50 ? `${content.slice(0, 50)}...` : content,
      });
    }

    await append({ role: 'user', content });
  }, [conversationId, isStreaming, addMessage, append, updateConversationSummary]);

  const handleNewConversation = useCallback(() => {
    const newId = createConversation();
    setActiveAgent(getDefaultAgent());
    setIsStreaming(false);
    setStreamingMessage(newId, null);
    streamingMsgRef.current = null;
  }, [createConversation, setActiveAgent, setIsStreaming, setStreamingMessage]);

  const handleStop = useCallback(() => {
    stop();
    setIsStreaming(false);
    if (streamingMsgRef.current) {
      updateMessage(conversationId, streamingMsgRef.current, { status: 'complete' });
      setStreamingMessage(conversationId, null);
      streamingMsgRef.current = null;
    }
  }, [stop, setIsStreaming, conversationId, updateMessage, setStreamingMessage]);

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <ConversationSidebar onNewConversation={handleNewConversation} />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && <div className="w-20" />}
            <AgentBadge
              agent={activeAgent}
              isStreaming={isStreaming}
              isHandoff={false}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 hidden sm:block">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>
        </header>

        {/* Messages / Empty state */}
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-12 overflow-y-auto">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mx-auto mb-4"
                >
                  ✨
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 mb-2"
                >
                  Multi-Agent AI Platform
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm"
                >
                  The right expert agent automatically handles your request. Seamless handoffs, zero friction.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <AgentRoster />
              </motion.div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              streamingMessageId={streamingMessageId}
              isStreaming={isStreaming}
              activeAgent={activeAgent}
            />
          )}

          {/* Input */}
          <MessageInput
            onSend={handleSend}
            onStop={handleStop}
            isStreaming={isStreaming}
            activeAgent={activeAgent}
            disabled={!conversationId}
          />
        </div>
      </div>
    </div>
  );
}
