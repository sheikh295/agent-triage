'use client'

import { useRef, useState, useCallback, KeyboardEvent } from 'react'
import { Send, Square, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/app/lib/utils'
import { AGENTS } from '@/app/lib/agents/registry'

interface ChatInputProps {
  onSend: (message: string, agentId?: string) => void
  onStop: () => void
  isStreaming: boolean
  activeAgentId?: string
}

export function ChatInput({ onSend, onStop, isStreaming, activeAgentId }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>(undefined)
  const [showAgentPicker, setShowAgentPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const msg = value.trim()
    if (!msg || isStreaming) return
    onSend(msg, selectedAgentId)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [value, isStreaming, onSend, selectedAgentId])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const selectedAgent = selectedAgentId ? AGENTS.find(a => a.id === selectedAgentId) : null
  const displayAgent = selectedAgent ?? (activeAgentId ? AGENTS.find(a => a.id === activeAgentId) : null)

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Agent selector */}
        <AnimatePresence>
          {showAgentPicker && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-2 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg"
            >
              <p className="text-xs text-zinc-400 px-2 py-1 mb-1">Force route to agent (or let AI decide):</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                <button
                  onClick={() => { setSelectedAgentId(undefined); setShowAgentPicker(false) }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                    !selectedAgentId
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  )}
                >
                  <span>🎯</span>
                  <span>Auto-route</span>
                </button>
                {AGENTS.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => { setSelectedAgentId(agent.id); setShowAgentPicker(false) }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors',
                      selectedAgentId === agent.id
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <span>{agent.emoji}</span>
                    <span className="truncate">{agent.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="flex items-end gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-200 dark:border-zinc-700 focus-within:border-zinc-400 dark:focus-within:border-zinc-500 transition-colors">
          {/* Agent picker button */}
          <button
            onClick={() => setShowAgentPicker(v => !v)}
            className={cn(
              'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors mb-1',
              showAgentPicker
                ? 'bg-zinc-200 dark:bg-zinc-700'
                : 'hover:bg-zinc-200 dark:hover:bg-zinc-700',
              displayAgent ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400'
            )}
            title="Choose agent"
          >
            <span>{displayAgent?.emoji ?? '🎯'}</span>
            <ChevronDown size={12} className={cn('transition-transform', showAgentPicker && 'rotate-180')} />
          </button>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => { setValue(e.target.value); handleInput() }}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none outline-none leading-relaxed max-h-[200px] overflow-y-auto"
          />

          <button
            onClick={isStreaming ? onStop : handleSend}
            disabled={!isStreaming && !value.trim()}
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all',
              isStreaming
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80'
                : value.trim()
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
            )}
          >
            {isStreaming ? <Square size={16} /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-2">
          AI agents automatically route your message. You can also manually select an agent.
        </p>
      </div>
    </div>
  )
}
