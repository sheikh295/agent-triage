'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Square } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Agent } from '@/types';

interface MessageInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  isStreaming: boolean;
  activeAgent: Agent | null;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  activeAgent,
  disabled,
  placeholder,
}: MessageInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const accentColor = activeAgent?.colorHex ?? '#3b82f6';

  return (
    <div className="px-4 pb-4 pt-2">
      <div
        className={cn(
          'relative flex items-end gap-2 rounded-2xl border bg-white dark:bg-zinc-900 transition-all duration-200',
          'border-zinc-200 dark:border-zinc-700',
          'focus-within:border-zinc-400 dark:focus-within:border-zinc-500',
          'shadow-sm'
        )}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? (activeAgent ? `Message ${activeAgent.name}...` : 'Message Agent Triage...')}
          rows={1}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none bg-transparent py-3.5 pl-4 pr-2 text-sm text-zinc-800 dark:text-zinc-100',
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            'focus:outline-none max-h-[200px] min-h-[52px] scrollbar-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />

        <div className="flex items-center gap-1 p-2">
          {isStreaming ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStop}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
                input.trim() && !disabled
                  ? 'text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
              )}
              style={input.trim() && !disabled ? { backgroundColor: accentColor } : undefined}
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-2">
        Agents automatically switch based on your message context
      </p>
    </div>
  );
}
