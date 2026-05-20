'use client'

import { useEffect, useRef } from 'react'
import { MessageItem } from './MessageItem'
import type { ChatMessage } from '@/app/types'

interface MessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  streamingContent: string
}

export function MessageList({ messages, isStreaming, streamingContent }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Multi-Agent AI Chat
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            Ask anything — the right AI agent will automatically take over.
            Coding, research, planning, and more.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {[
              '💻 Write a React component',
              '🔬 Research quantum computing',
              '📋 Plan a product launch',
              '📝 Summarize this article',
            ].map(s => (
              <span key={s} className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs text-zinc-600 dark:text-zinc-400">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {messages.map(msg => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {isStreaming && (
          <MessageItem
            message={{
              id: 'streaming',
              conversationId: '',
              role: 'assistant',
              content: streamingContent,
              createdAt: new Date().toISOString(),
            }}
            isStreaming
            streamingContent={streamingContent}
          />
        )}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  )
}
