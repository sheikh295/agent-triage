'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AgentAvatar } from '@/components/ui/Avatar';
import type { Agent } from '@/types';

interface HandoffNoticeProps {
  from: Agent;
  to: Agent;
}

export function HandoffNotice({ from, to }: HandoffNoticeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center gap-3 py-2 my-2"
    >
      <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
        <AgentAvatar emoji={from.emoji} name={from.name} size="xs" colorHex={from.colorHex} />
        <span className="text-xs text-zinc-400">{from.name}</span>
        <ArrowRight className="w-3 h-3 text-zinc-400" />
        <AgentAvatar emoji={to.emoji} name={to.name} size="xs" colorHex={to.colorHex} />
        <span className="text-xs font-medium" style={{ color: to.colorHex }}>{to.name}</span>
      </div>
      <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
    </motion.div>
  );
}
