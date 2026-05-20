'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AgentAvatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Agent } from '@/types';

interface AgentBadgeProps {
  agent: Agent | null;
  isStreaming?: boolean;
  isHandoff?: boolean;
  previousAgent?: Agent | null;
}

export function AgentBadge({ agent, isStreaming, isHandoff, previousAgent }: AgentBadgeProps) {
  if (!agent) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={agent.id}
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2"
      >
        {isHandoff && previousAgent && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-xs text-zinc-400"
          >
            <span>{previousAgent.emoji}</span>
            <span className="text-zinc-300 dark:text-zinc-600">→</span>
          </motion.div>
        )}

        <AgentAvatar
          emoji={agent.emoji}
          name={agent.name}
          size="sm"
          colorHex={agent.colorHex}
        />

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {agent.name}
          </span>
          <Badge variant="agent" colorHex={agent.colorHex}>
            {agent.domain}
          </Badge>
          {isStreaming && (
            <motion.div
              className="flex gap-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: agent.colorHex }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
