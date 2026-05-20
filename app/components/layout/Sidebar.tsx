'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Trash2, X, PanelLeft } from 'lucide-react'
import { useChatStore } from '@/app/store/chatStore'
import { cn } from '@/app/lib/utils'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
}

export function Sidebar({ onNewConversation, onSelectConversation }: SidebarProps) {
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    setSidebarOpen,
    removeConversation,
    setConversations,
  } = useChatStore()

  useEffect(() => {
    fetch('/api/conversations')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setConversations(data)
      })
      .catch(console.error)
  }, [setConversations])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await fetch(`/api/conversations/${id}`, { method: 'DELETE' })
      removeConversation(id)
    } catch (err) {
      console.error('Failed to delete conversation:', err)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-10 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed sm:relative z-20 sm:z-auto flex flex-col w-[260px] h-full bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">AgentChat</span>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors sm:hidden"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* New chat button */}
            <div className="p-3">
              <button
                onClick={onNewConversation}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 transition-opacity"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {conversations.length === 0 ? (
                <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-8">No conversations yet</p>
              ) : (
                <div className="space-y-0.5">
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => onSelectConversation(conv.id)}
                      className={cn(
                        'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                        activeConversationId === conv.id
                          ? 'bg-zinc-200 dark:bg-zinc-800'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      )}
                    >
                      <MessageSquare size={14} className="flex-shrink-0 text-zinc-400" />
                      <span className="flex-1 text-xs text-zinc-700 dark:text-zinc-300 truncate">
                        {conv.title || 'New Conversation'}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button (always visible when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-3 left-3 z-10 p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
          title="Open sidebar"
        >
          <PanelLeft size={18} className="text-zinc-600 dark:text-zinc-400" />
        </button>
      )}
    </>
  )
}
