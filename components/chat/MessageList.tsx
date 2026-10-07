'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { HandoffNotice } from './HandoffNotice';
import { TypingIndicator } from './TypingIndicator';
import type { Message, Agent } from '@/types';
import { AGENTS } from '@/lib/agents/registry';

interface MessageListProps {
  messages: Message[];
  streamingMessageId: string | null;
  isStreaming: boolean;
  activeAgent: Agent | null;
}

export function MessageList({ messages, streamingMessageId, isStreaming, activeAgent }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const renderMessages = () => {
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // Insert handoff notice before a handoff message
      if (
        msg.role === 'assistant' &&
        msg.isHandoff &&
        msg.handoffFrom &&
        msg.agentId &&
        msg.handoffFrom !== msg.agentId
      ) {
        const fromAgent = AGENTS.find(a => a.id === msg.handoffFrom);
        const toAgent = AGENTS.find(a => a.id === msg.agentId);
        if (fromAgent && toAgent) {
          elements.push(
            <HandoffNotice key={`handoff-${msg.id}`} from={fromAgent} to={toAgent} />
          );
        }
      }

      elements.push(
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={msg.id === streamingMessageId}
        />
      );
    }

    return elements;
  };

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-0.5">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 py-16">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
            ✨
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Start a conversation
            </h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs">
              Ask anything. The right agent will automatically take over based on your needs.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {renderMessages()}
      </AnimatePresence>

      {/* Typing indicator when streaming but no streaming message yet */}
      <AnimatePresence>
        {isStreaming && activeAgent && !streamingMessageId && (
          <TypingIndicator key="typing" agent={activeAgent} />
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
