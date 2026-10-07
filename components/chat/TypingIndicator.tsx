'use client';

import { motion } from 'framer-motion';
import { AgentAvatar } from '@/components/ui/Avatar';
import type { Agent } from '@/types';

interface TypingIndicatorProps {
  agent: Agent;
}

export function TypingIndicator({ agent }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 px-4 py-2"
    >
      <AgentAvatar emoji={agent.emoji} name={agent.name} size="sm" colorHex={agent.colorHex} />
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-tl-sm"
        style={{ backgroundColor: `${agent.colorHex}10`, border: `1px solid ${agent.colorHex}20` }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: agent.colorHex }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
