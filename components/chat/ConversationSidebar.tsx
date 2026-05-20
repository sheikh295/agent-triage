'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useChatStore } from '@/store/chatStore';
import type { ConversationSummary } from '@/types';

interface SidebarConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function SidebarConversationItem({ conversation, isActive, onSelect, onDelete }: SidebarConversationItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
        isActive
          ? 'bg-zinc-100 dark:bg-zinc-800'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
      )}
      onClick={onSelect}
    >
      <span className="text-base flex-shrink-0">{conversation.lastAgentEmoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm truncate',
          isActive ? 'text-zinc-900 dark:text-zinc-50 font-medium' : 'text-zinc-700 dark:text-zinc-300'
        )}>
          {conversation.title}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
          {conversation.lastMessage || 'No messages yet'}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        title="Delete conversation"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

interface ConversationSidebarProps {
  onNewConversation: () => void;
}

export function ConversationSidebar({ onNewConversation }: ConversationSidebarProps) {
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    setActiveConversation,
    deleteConversation,
    toggleSidebar,
  } = useChatStore();

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-shrink-0 h-full flex flex-col border-r border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white dark:text-zinc-900" />
                </div>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Agent Triage</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* New Chat button */}
            <div className="px-3 py-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-zinc-600 dark:text-zinc-400"
                onClick={onNewConversation}
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New conversation
              </Button>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                  <MessageSquare className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">No conversations yet</p>
                </div>
              ) : (
                <AnimatePresence>
                  {conversations.map((conv) => (
                    <SidebarConversationItem
                      key={conv.id}
                      conversation={conv}
                      isActive={conv.id === activeConversationId}
                      onSelect={() => setActiveConversation(conv.id)}
                      onDelete={() => deleteConversation(conv.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                Multi-agent AI platform
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar toggle when closed */}
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors shadow-sm"
            title="Open sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNewConversation}
            className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors shadow-sm"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
