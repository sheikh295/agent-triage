import { getProvider } from '../providers'
import { AGENTS, getAgent, getDefaultAgent, type AgentDefinition } from './registry'
import type { Message } from '../providers/types'

export interface TriageResult {
  agent: AgentDefinition
  confidence: number
  reason: string
}

function keywordTriage(userMessage: string): TriageResult {
  const lower = userMessage.toLowerCase()

  const scores: Record<string, number> = {}

  for (const agent of AGENTS) {
    scores[agent.id] = 0
    for (const keyword of agent.specialty) {
      if (lower.includes(keyword)) {
        scores[agent.id] += 1
      }
    }
  }

  const topAgentId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  const topScore = scores[topAgentId]

  if (topScore === 0) {
    const defaultAgent = getDefaultAgent()
    return { agent: defaultAgent, confidence: 0.5, reason: 'Default routing' }
  }

  const agent = getAgent(topAgentId)!
  return {
    agent,
    confidence: Math.min(topScore / 3, 1),
    reason: `Message matched ${topAgentId} specialties`,
  }
}

async function llmTriage(userMessage: string, conversationHistory: Message[]): Promise<TriageResult> {
  const agentList = AGENTS.map(a =>
    `- ${a.id}: ${a.name} — ${a.description} (specialties: ${a.specialty.slice(0, 5).join(', ')})`
  ).join('\n')

  const prompt = `You are an intelligent routing system. Given a user message, select the best agent to respond.

Available agents:
${agentList}

User message: "${userMessage}"
${conversationHistory.length > 0 ? `\nConversation context: ${conversationHistory.slice(-2).map(m => `${m.role}: ${m.content.slice(0, 100)}`).join(' | ')}` : ''}

Respond with ONLY a JSON object: {"agentId": "<id>", "reason": "<brief reason>"}
Choose the most appropriate agent. If unsure, use "general".`

  try {
    const provider = getProvider('openai')
    const response = await provider.chat(
      [{ role: 'user', content: prompt }],
      { model: 'gpt-4o-mini', temperature: 0.1 }
    )

    const parsed = JSON.parse(response.trim())
    const agent = getAgent(parsed.agentId) ?? getDefaultAgent()

    return {
      agent,
      confidence: 0.9,
      reason: parsed.reason ?? 'LLM routing decision',
    }
  } catch {
    return keywordTriage(userMessage)
  }
}

export async function triageMessage(
  userMessage: string,
  conversationHistory: Message[],
  currentAgentId?: string,
  useLLM = false
): Promise<TriageResult> {
  if (currentAgentId) {
    const agent = getAgent(currentAgentId)
    if (agent) {
      return { agent, confidence: 1, reason: 'Explicitly selected' }
    }
  }

  if (useLLM && process.env.OPENAI_API_KEY) {
    return llmTriage(userMessage, conversationHistory)
  }

  return keywordTriage(userMessage)
}

export interface StreamChatOptions {
  messages: Message[]
  userMessage: string
  agentId?: string
  onChunk: (text: string) => void
  onAgentSelected: (agentId: string, agentName: string, reason: string) => void
}

export async function streamWithAgent(options: StreamChatOptions): Promise<void> {
  const { messages, userMessage, agentId, onChunk, onAgentSelected } = options

  const triage = await triageMessage(userMessage, messages, agentId, true)
  const agent = triage.agent

  onAgentSelected(agent.id, agent.name, triage.reason)

  const provider = getProvider(agent.provider)

  const chatMessages: Message[] = [
    ...messages,
    { role: 'user', content: userMessage },
  ]

  await provider.stream(
    chatMessages,
    {
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      temperature: 0.7,
    },
    (chunk) => {
      if (chunk.text) onChunk(chunk.text)
    }
  )
}
