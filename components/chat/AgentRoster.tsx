'use client';

import { motion } from 'framer-motion';
import { AgentAvatar } from '@/components/ui/Avatar';
import { AGENTS } from '@/lib/agents/registry';

interface AgentRosterProps {
  onAgentClick?: (agentId: string) => void;
}

export function AgentRoster({ onAgentClick }: AgentRosterProps) {
  const agents = AGENTS.filter(a => a.active);

  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
      {agents.map((agent, i) => (
        <motion.button
          key={agent.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.04 }}
          onClick={() => onAgentClick?.(agent.id)}
          className="flex items-center gap-2.5 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all text-left group"
        >
          <AgentAvatar emoji={agent.emoji} name={agent.name} size="sm" colorHex={agent.colorHex} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{agent.name}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{agent.domain}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
