'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AGENTS } from '@/app/lib/agents/registry'

interface AgentBadgeProps {
  agentId: string
  agentName: string
  reason?: string
  showReason?: boolean
}

export function AgentBadge({ agentId, agentName, reason, showReason }: AgentBadgeProps) {
  const agent = AGENTS.find(a => a.id === agentId)
  const color = agent?.color ?? '#6366f1'
  const emoji = agent?.emoji ?? '🤖'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          <span>{emoji}</span>
          <span>{agentName}</span>
        </span>
        {showReason && reason && reason !== 'Default routing' && reason !== 'Explicitly selected' && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">{reason}</span>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
