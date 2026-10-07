import type { Agent, Message, TriageResult } from '@/types';
import { AGENTS, getDefaultAgent } from '@/lib/agents/registry';

interface TriageContext {
  messages: Message[];
  currentAgentId: string;
  userMessage: string;
}

/**
 * Score how well an agent matches the given message content.
 * Uses keyword matching + domain analysis.
 */
function scoreAgentMatch(agent: Agent, text: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;

  for (const keyword of agent.keywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += keyword.length > 5 ? 2 : 1; // longer keywords score higher
    }
  }

  return score;
}

/**
 * Determine if a handoff is warranted based on confidence threshold.
 */
function shouldHandoff(
  currentAgentId: string,
  bestAgentId: string,
  bestScore: number,
  currentScore: number
): boolean {
  if (bestAgentId === currentAgentId) return false;
  if (bestAgentId === 'general' && bestScore < 3) return false;
  // Only handoff if new agent scores significantly better
  const threshold = Math.max(2, currentScore * 0.8);
  return bestScore >= threshold;
}

/**
 * Main triage function: determines the best agent for a given message.
 */
export function triageMessage(context: TriageContext): TriageResult {
  const { messages, currentAgentId, userMessage } = context;

  // Build context from recent messages (last 3 user messages for relevance)
  const recentUserMessages = messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content)
    .join(' ');

  const fullContext = `${recentUserMessages} ${userMessage}`;
  const activeAgents = AGENTS.filter(a => a.active);

  const scores = activeAgents.map(agent => ({
    agent,
    score: scoreAgentMatch(agent, fullContext),
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  const best = scores[0];
  const currentAgentScore = scores.find(s => s.agent.id === currentAgentId)?.score ?? 0;

  let selectedAgent: Agent;
  let isHandoff = false;
  let confidence: number;
  let reasoning: string;

  if (best.score === 0) {
    // No keywords matched — stay with current agent or use general
    const currentAgent = AGENTS.find(a => a.id === currentAgentId);
    selectedAgent = currentAgent ?? getDefaultAgent();
    confidence = 0.5;
    reasoning = `No specific domain detected. Continuing with ${selectedAgent.name}.`;
  } else if (shouldHandoff(currentAgentId, best.agent.id, best.score, currentAgentScore)) {
    selectedAgent = best.agent;
    isHandoff = true;
    confidence = Math.min(0.95, 0.5 + best.score * 0.05);
    reasoning = `Detected ${best.agent.domain} domain (score: ${best.score}). Routing to ${best.agent.name}.`;
  } else {
    const currentAgent = AGENTS.find(a => a.id === currentAgentId);
    selectedAgent = currentAgent ?? getDefaultAgent();
    confidence = 0.7;
    reasoning = `Staying with ${selectedAgent.name} — domain context matches current agent.`;
  }

  return {
    agentId: selectedAgent.id,
    agentName: selectedAgent.name,
    confidence,
    reasoning,
    isHandoff,
    previousAgentId: isHandoff ? currentAgentId : undefined,
  };
}

/**
 * Generate a handoff message that explains the agent switch.
 */
export function generateHandoffMessage(from: Agent, to: Agent): string {
  return `*Handing off to **${to.emoji} ${to.name}** (${to.description})*`;
}
