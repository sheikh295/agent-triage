'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { AgentBadge } from './AgentBadge'
import { TypingIndicator } from './TypingIndicator'
import { cn } from '@/app/lib/utils'
import { AGENTS } from '@/app/lib/agents/registry'
import type { ChatMessage } from '@/app/types'

interface MessageItemProps {
  message: ChatMessage
  isStreaming?: boolean
  streamingContent?: string
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
      title="Copy"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

export function MessageItem({ message, isStreaming, streamingContent }: MessageItemProps) {
  const isUser = message.role === 'user'
  const content = isStreaming ? streamingContent ?? '' : message.content
  const [msgCopied, setMsgCopied] = useState(false)

  const agentEmoji = message.agentId
    ? (AGENTS.find(a => a.id === message.agentId)?.emoji ?? '🤖')
    : '🤖'

  return (
    <div className={cn('group flex gap-3 py-4 px-4 sm:px-6', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
          isUser
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
            : 'bg-zinc-100 dark:bg-zinc-800'
        )}
      >
        {isUser ? 'U' : agentEmoji}
      </div>

      {/* Content */}
      <div className={cn('flex flex-col gap-1 max-w-[80%]', isUser && 'items-end')}>
        {/* Agent badge for assistant messages */}
        {!isUser && message.agentId && message.agentName && (
          <AgentBadge agentId={message.agentId} agentName={message.agentName} />
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm'
              : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
          )}
        >
          {isStreaming && !content ? (
            <TypingIndicator />
          ) : (
            <>
              {isUser ? (
                <p className="whitespace-pre-wrap">{content}</p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeStr = String(children).replace(/\n$/, '')
                      if (match) {
                        return (
                          <div className="relative group/code my-2">
                            <div className="flex items-center justify-between bg-zinc-900 rounded-t-lg px-3 py-1.5">
                              <span className="text-xs text-zinc-400">{match[1]}</span>
                              <CopyButton text={codeStr} />
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              className="!mt-0 !rounded-t-none !rounded-b-lg !text-xs"
                            >
                              {codeStr}
                            </SyntaxHighlighter>
                          </div>
                        )
                      }
                      return (
                        <code className="bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-zinc-300 dark:border-zinc-600 pl-3 italic text-zinc-600 dark:text-zinc-400 my-2">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full text-xs border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="border border-zinc-300 dark:border-zinc-600 px-2 py-1 bg-zinc-200 dark:bg-zinc-700 font-semibold text-left">{children}</th>,
                    td: ({ children }) => <td className="border border-zinc-300 dark:border-zinc-600 px-2 py-1">{children}</td>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
            </>
          )}
        </div>

        {/* Copy message button */}
        {!isUser && content && !isStreaming && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(content)
              setMsgCopied(true)
              setTimeout(() => setMsgCopied(false), 2000)
            }}
            className="opacity-0 group-hover:opacity-100 self-start flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all mt-1"
          >
            {msgCopied ? <Check size={12} /> : <Copy size={12} />}
            {msgCopied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}
