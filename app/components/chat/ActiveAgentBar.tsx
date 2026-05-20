'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AgentBadge } from './AgentBadge'

interface ActiveAgentBarProps {
  agentId: string
  agentName: string
  reason?: string
}

export function ActiveAgentBar({ agentId, agentName, reason }: ActiveAgentBarProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="border-b border-zinc-100 dark:border-zinc-800 px-4 py-2 bg-white dark:bg-zinc-950"
      >
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-xs text-zinc-400">Responding:</span>
          <AgentBadge agentId={agentId} agentName={agentName} reason={reason} showReason />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
