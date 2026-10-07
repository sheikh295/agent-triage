'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, Bot } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AgentAvatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Message } from '@/types';
import { AGENTS } from '@/lib/agents/registry';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 transition-colors opacity-0 group-hover:opacity-100"
      title="Copy message"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const agent = message.agentId ? AGENTS.find(a => a.id === message.agentId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 px-4 py-2 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-7 h-7 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs text-white dark:text-zinc-900 font-medium">U</span>
        </div>
      ) : (
        <div className="flex-shrink-0 mt-0.5">
          {agent ? (
            <AgentAvatar emoji={agent.emoji} name={agent.name} size="sm" colorHex={agent.colorHex} />
          ) : (
            <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn('flex flex-col gap-1 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
        {/* Agent name for assistant messages */}
        {!isUser && agent && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{agent.name}</span>
            {message.isHandoff && (
              <Badge variant="agent" colorHex={agent.colorHex}>
                new agent
              </Badge>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-tr-sm'
              : 'bg-zinc-50 text-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-100 rounded-tl-sm border border-zinc-100 dark:border-zinc-700/50'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700 prose-code:text-blue-400 prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // Destructure `node` from props to exclude it from the DOM spread
                  // (react-markdown passes it as ExtraProps; it's not a valid HTML attribute).
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  pre: ({ node, children, ...props }) => (
                    <div className="relative group/code">
                      <pre {...props} className="overflow-x-auto">
                        {children}
                      </pre>
                    </div>
                  ),
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  code: ({ node, className, children, ...props }) => {
                    // Block code has a language-* class injected by rehype-highlight
                    const isBlock = className?.includes('language-');
                    if (isBlock) {
                      return <code className={className} {...props}>{children}</code>;
                    }
                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-700 text-blue-600 dark:text-blue-400 font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-zinc-400 ml-0.5 align-middle"
                />
              )}
            </div>
          )}
        </div>

        {/* Actions row */}
        <div className={cn('flex items-center gap-1 mt-0.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <CopyButton text={message.content} />
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!isUser && message.model && (
            <span className="text-xs text-zinc-300 dark:text-zinc-600">{message.model}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
