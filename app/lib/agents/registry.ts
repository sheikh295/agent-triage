export interface AgentDefinition {
  id: string
  name: string
  description: string
  systemPrompt: string
  model: string
  provider: string
  specialty: string[]
  emoji: string
  color: string
}

export const AGENTS: AgentDefinition[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'A helpful all-around assistant for everyday questions and tasks.',
    systemPrompt: `You are a helpful, friendly, and knowledgeable general assistant. 
You can help with a wide variety of tasks including answering questions, 
writing, analysis, and general problem-solving. Be concise, clear, and helpful.`,
    model: 'gpt-4o-mini',
    provider: 'openai',
    specialty: ['general', 'questions', 'writing', 'help', 'explain', 'what', 'how', 'why'],
    emoji: '🤖',
    color: '#6366f1',
  },
  {
    id: 'coding',
    name: 'Coding Agent',
    description: 'Expert software engineer for coding, debugging, and technical questions.',
    systemPrompt: `You are an expert software engineer and coding assistant. 
You excel at writing, reviewing, and debugging code across all programming languages.
Always provide clean, well-commented code examples. Explain your reasoning.
Format code blocks properly with the appropriate language identifier.`,
    model: 'gpt-4o',
    provider: 'openai',
    specialty: ['code', 'programming', 'debug', 'function', 'class', 'bug', 'error', 'implement', 'algorithm', 'javascript', 'python', 'typescript', 'react', 'api', 'database', 'sql', 'html', 'css'],
    emoji: '💻',
    color: '#10b981',
  },
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Deep researcher for analysis, fact-finding, and comprehensive reports.',
    systemPrompt: `You are a thorough and analytical research assistant. 
You excel at gathering information, analyzing topics in depth, and presenting 
well-structured, comprehensive overviews. You cite sources when relevant, 
break down complex topics, and provide nuanced analysis.`,
    model: 'claude-opus-4-5',
    provider: 'anthropic',
    specialty: ['research', 'analyze', 'study', 'report', 'compare', 'review', 'history', 'science', 'data', 'statistics', 'trends', 'market'],
    emoji: '🔬',
    color: '#f59e0b',
  },
  {
    id: 'planning',
    name: 'Planning Agent',
    description: 'Strategic planner for business, projects, goals, and roadmaps.',
    systemPrompt: `You are a strategic planning expert and business advisor. 
You excel at breaking down complex goals into actionable plans, creating 
roadmaps, identifying risks and opportunities, and structuring projects 
for success. You think systematically and present plans in clear, 
organized formats with timelines and priorities.`,
    model: 'gpt-4o',
    provider: 'openai',
    specialty: ['plan', 'strategy', 'business', 'project', 'goal', 'roadmap', 'organize', 'startup', 'launch', 'schedule', 'timeline', 'budget', 'team'],
    emoji: '📋',
    color: '#8b5cf6',
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    description: 'Concise summarizer for distilling long content into key points.',
    systemPrompt: `You are an expert at reading and summarizing content. 
You excel at distilling complex or lengthy material into clear, concise summaries 
that capture the essential points. You use bullet points, headers, and TLDRs 
effectively. Always preserve the most important information.`,
    model: 'gpt-4o-mini',
    provider: 'openai',
    specialty: ['summarize', 'summary', 'tldr', 'brief', 'condense', 'shorten', 'key points', 'overview'],
    emoji: '📝',
    color: '#ef4444',
  },
]

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENTS.find(a => a.id === id)
}

export function getDefaultAgent(): AgentDefinition {
  return AGENTS[0]
}
