'use client'

import { useCallback, useRef } from 'react'
import { useChatStore } from '../store/chatStore'
import type { ChatMessage, StreamEvent } from '../types'

export function useChat() {
  const {
    messages,
    isStreaming,
    streamingContent,
    activeAgent,
    activeConversationId,
    addMessage,
    setIsStreaming,
    setStreamingContent,
    setActiveAgent,
    setActiveConversation,
    addConversation,
    updateConversation,
    handleStreamEvent,
  } = useChatStore()

  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, selectedAgentId?: string) => {
    if (!content.trim() || isStreaming) return

    abortRef.current = new AbortController()

    const userMsg: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      conversationId: activeConversationId ?? '',
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    addMessage(userMsg)
    setIsStreaming(true)
    setStreamingContent('')
    setActiveAgent(null)

    let finalConvId = activeConversationId

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: content,
          agentId: selectedAgentId,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('Failed to send message')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data) continue

          try {
            const event: StreamEvent = JSON.parse(data)
            handleStreamEvent(event)

            if (event.type === 'conversation' && event.conversationId) {
              finalConvId = event.conversationId
              if (!activeConversationId) {
                setActiveConversation(event.conversationId)
                addConversation({
                  id: event.conversationId,
                  title: content.slice(0, 60),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }
            }
          } catch { /* skip invalid JSON */ }
        }
      }

      const streaming = useChatStore.getState().streamingContent
      const agent = useChatStore.getState().activeAgent
      if (streaming) {
        const assistantMsg: ChatMessage = {
          id: `temp-assistant-${Date.now()}`,
          conversationId: finalConvId ?? '',
          role: 'assistant',
          content: streaming,
          agentId: agent?.id,
          agentName: agent?.name,
          createdAt: new Date().toISOString(),
        }
        addMessage(assistantMsg)
      }

      if (finalConvId) {
        updateConversation(finalConvId, {
          title: content.slice(0, 60),
          updatedAt: new Date().toISOString(),
        })
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Chat error:', err)
      }
    } finally {
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [activeConversationId, isStreaming, addMessage, setIsStreaming, setStreamingContent, setActiveAgent, setActiveConversation, addConversation, updateConversation, handleStreamEvent])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return {
    messages,
    isStreaming,
    streamingContent,
    activeAgent,
    sendMessage,
    stopStreaming,
  }
}
