'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Message, ConversationSummary, Agent } from '@/types';

interface ChatState {
  // Conversations
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  conversationMessages: Record<string, Message[]>;

  // Active state
  activeAgent: Agent | null;
  isStreaming: boolean;
  streamingMessageId: string | null;

  // UI state
  sidebarOpen: boolean;

  // Actions
  setActiveConversation: (id: string) => void;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  setStreamingMessage: (conversationId: string, messageId: string | null, content?: string) => void;
  setActiveAgent: (agent: Agent | null) => void;
  setIsStreaming: (streaming: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  updateConversationSummary: (summary: Partial<ConversationSummary> & { id: string }) => void;
  clearConversation: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      conversationMessages: {},
      activeAgent: null,
      isStreaming: false,
      streamingMessageId: null,
      sidebarOpen: true,

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      createConversation: () => {
        const id = nanoid();
        const summary: ConversationSummary = {
          id,
          title: 'New Conversation',
          lastMessage: '',
          lastAgentId: 'general',
          lastAgentName: 'Nova',
          lastAgentEmoji: '✨',
          timestamp: new Date(),
          messageCount: 0,
        };
        set(state => ({
          conversations: [summary, ...state.conversations],
          activeConversationId: id,
          conversationMessages: { ...state.conversationMessages, [id]: [] },
        }));
        return id;
      },

      deleteConversation: (id) => {
        set(state => {
          const conversations = state.conversations.filter(c => c.id !== id);
          const { [id]: _, ...rest } = state.conversationMessages;
          const activeConversationId =
            state.activeConversationId === id
              ? (conversations[0]?.id ?? null)
              : state.activeConversationId;
          return { conversations, conversationMessages: rest, activeConversationId };
        });
      },

      addMessage: (conversationId, message) => {
        set(state => ({
          conversationMessages: {
            ...state.conversationMessages,
            [conversationId]: [
              ...(state.conversationMessages[conversationId] ?? []),
              message,
            ],
          },
        }));
      },

      updateMessage: (conversationId, messageId, updates) => {
        set(state => ({
          conversationMessages: {
            ...state.conversationMessages,
            [conversationId]: (state.conversationMessages[conversationId] ?? []).map(
              m => m.id === messageId ? { ...m, ...updates } : m
            ),
          },
        }));
      },

      setStreamingMessage: (conversationId, messageId, content) => {
        if (messageId === null) {
          set({ streamingMessageId: null });
          return;
        }
        set(state => {
          const messages = state.conversationMessages[conversationId] ?? [];
          const existing = messages.find(m => m.id === messageId);
          if (!existing) return {};
          return {
            streamingMessageId: messageId,
            conversationMessages: {
              ...state.conversationMessages,
              [conversationId]: messages.map(m =>
                m.id === messageId
                  ? { ...m, content: content ?? m.content, status: 'streaming' as const }
                  : m
              ),
            },
          };
        });
      },

      setActiveAgent: (agent) => set({ activeAgent: agent }),
      setIsStreaming: (streaming) => set({ isStreaming: streaming }),
      toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      updateConversationSummary: (summary) => {
        set(state => ({
          conversations: state.conversations.map(c =>
            c.id === summary.id ? { ...c, ...summary } : c
          ),
        }));
      },

      clearConversation: (conversationId) => {
        set(state => ({
          conversationMessages: { ...state.conversationMessages, [conversationId]: [] },
        }));
      },
    }),
    {
      name: 'agent-triage-chat',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        conversationMessages: state.conversationMessages,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
