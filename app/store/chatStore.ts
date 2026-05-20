import { create } from 'zustand'
import type { ChatMessage, Conversation, StreamEvent } from '../types'

interface ActiveAgent {
  id: string
  name: string
  reason: string
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
  activeAgent: ActiveAgent | null
  sidebarOpen: boolean

  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  setIsStreaming: (value: boolean) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (text: string) => void
  setActiveAgent: (agent: ActiveAgent | null) => void
  setSidebarOpen: (open: boolean) => void
  handleStreamEvent: (event: StreamEvent) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  removeConversation: (id: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isStreaming: false,
  streamingContent: '',
  activeAgent: null,
  sidebarOpen: true,

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set(state => ({ messages: [...state.messages, message] })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingContent: (streamingContent) => set({ streamingContent }),
  appendStreamingContent: (text) => set(state => ({ streamingContent: state.streamingContent + text })),
  setActiveAgent: (activeAgent) => set({ activeAgent }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  handleStreamEvent: (event: StreamEvent) => {
    const state = get()
    switch (event.type) {
      case 'conversation':
        if (event.conversationId && !state.activeConversationId) {
          set({ activeConversationId: event.conversationId })
        }
        break
      case 'agent':
        if (event.agentId && event.agentName) {
          set({ activeAgent: { id: event.agentId, name: event.agentName, reason: event.reason ?? '' } })
        }
        break
      case 'chunk':
        if (event.text) {
          set(s => ({ streamingContent: s.streamingContent + event.text }))
        }
        break
      case 'done':
        break
    }
  },

  addConversation: (conversation) =>
    set(state => ({ conversations: [conversation, ...state.conversations] })),

  updateConversation: (id, updates) =>
    set(state => ({
      conversations: state.conversations.map(c => c.id === id ? { ...c, ...updates } : c),
    })),

  removeConversation: (id) =>
    set(state => ({ conversations: state.conversations.filter(c => c.id !== id) })),
}))
