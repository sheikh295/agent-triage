'use client'

import { useCallback } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { ActiveAgentBar } from './ActiveAgentBar'
import { Sidebar } from '../layout/Sidebar'
import { useChat } from '@/app/hooks/useChat'
import { useChatStore } from '@/app/store/chatStore'

export function ChatInterface() {
  const { messages, isStreaming, streamingContent, activeAgent, sendMessage, stopStreaming } = useChat()
  const { setActiveConversation, setMessages } = useChatStore()

  const handleNewConversation = useCallback(() => {
    setActiveConversation(null)
    setMessages([])
  }, [setActiveConversation, setMessages])

  const handleSelectConversation = useCallback(async (id: string) => {
    setActiveConversation(id)
    try {
      const res = await fetch(`/api/conversations/${id}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
    }
  }, [setActiveConversation, setMessages])

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Active agent bar */}
        {activeAgent && (
          <ActiveAgentBar
            agentId={activeAgent.id}
            agentName={activeAgent.name}
            reason={activeAgent.reason}
          />
        )}

        {/* Messages */}
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          activeAgentId={activeAgent?.id}
        />
      </div>
    </div>
  )
}
