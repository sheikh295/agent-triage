# Agent Triage — Multi-Agent AI Chat Platform

A production-grade AI chat platform with intelligent multi-agent orchestration, dynamic handoffs, and support for multiple LLM providers.

![Agent Triage](public/next.svg)

## Features

- **Multi-Agent Orchestration** — 9 specialized AI agents that automatically route based on your message context
- **Intelligent Triage** — Real-time intent analysis and confidence scoring determines the best agent
- **Seamless Handoffs** — Agents switch mid-conversation with visual transitions and full context preservation
- **Multi-Provider Support** — OpenAI, Anthropic Claude, Google Gemini, DeepSeek, Groq, Ollama
- **Streaming Responses** — Real-time token streaming with typing indicators
- **Markdown Rendering** — Full markdown with syntax-highlighted code blocks
- **Conversation History** — Persistent sidebar with all your conversations
- **Beautiful UI** — Minimal, dark/light mode, smooth animations with Framer Motion

## Agents

| Agent | Name | Specialty |
|-------|------|-----------|
| ✨ | Nova | General assistant (default) |
| ⚡ | Axiom | Coding & software engineering |
| 🔍 | Sage | Research & analysis |
| 🏛️ | Blueprint | Software architecture & system design |
| 🔧 | Forge | DevOps, Docker, CI/CD |
| 🎨 | Canvas | UI/UX design & CSS |
| 📝 | Echo | Summarization & distillation |
| 🗺️ | Vector | Project planning & strategy |
| 🐛 | Trace | Debugging & root cause analysis |

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **AI**: Vercel AI SDK, OpenAI, Anthropic, Google Gemini
- **State**: Zustand with persistence
- **Animations**: Framer Motion
- **Markdown**: react-markdown + rehype-highlight

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/sheikh295/agent-triage.git
cd agent-triage
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

You need at least **one** API key configured:
- `OPENAI_API_KEY` — for most agents
- `ANTHROPIC_API_KEY` — for research and architecture agents

### 3. Run development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Build for production

```bash
pnpm build
pnpm start
```

## How Agent Triage Works

1. **You send a message** in the chat interface
2. **Triage engine analyzes** your message content using keyword scoring and domain detection
3. **Best agent is selected** with confidence scoring
4. **Handoff occurs** if a different specialist is more appropriate
5. **Visual transition** shows which agent is now active
6. **Response streams** from the selected agent with full conversation context preserved

### Example Flow

```
User: "Hello, how are you?"
→ Nova (general) responds

User: "Can you write a React hook for fetching data?"
→ Axiom (coding) takes over with a visual handoff

User: "What are the architectural trade-offs between REST and GraphQL?"
→ Blueprint (architecture) takes over

User: "Summarize our conversation so far"
→ Echo (summarizer) condenses everything
```

## Project Structure

```
agent-triage/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Streaming chat endpoint
│   │   ├── conversations/         # Conversation CRUD
│   │   └── agents/route.ts        # Agent list endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx      # Main chat component
│   │   ├── MessageList.tsx        # Scrollable message list
│   │   ├── MessageBubble.tsx      # Individual message (markdown)
│   │   ├── MessageInput.tsx       # Auto-resize input
│   │   ├── AgentBadge.tsx         # Active agent indicator
│   │   ├── HandoffNotice.tsx      # Agent transition divider
│   │   ├── TypingIndicator.tsx    # Streaming dots animation
│   │   ├── ConversationSidebar.tsx # Sidebar with history
│   │   └── AgentRoster.tsx        # Agent grid (empty state)
│   ├── ui/                        # Reusable UI components
│   └── providers/                 # React context providers
├── lib/
│   ├── agents/registry.ts         # Agent definitions
│   ├── orchestration/triage.ts    # Routing engine
│   ├── providers/factory.ts       # LLM provider adapters
│   ├── memory/store.ts            # Server-side conversation store
│   └── utils/cn.ts                # Class utility
├── store/
│   ├── chatStore.ts               # Zustand chat state
│   └── agentStore.ts              # Zustand agent state
└── types/index.ts                 # TypeScript definitions
```

## Adding Providers

To add a new LLM provider, edit `lib/providers/factory.ts`:

```typescript
case 'myprovider': {
  const client = createOpenAI({
    apiKey: process.env.MYPROVIDER_API_KEY,
    baseURL: 'https://api.myprovider.com/v1',
  });
  return client(model);
}
```

## Adding Agents

To add a new agent, add an entry to `lib/agents/registry.ts`:

```typescript
{
  id: 'legal',
  name: 'Lex',
  emoji: '⚖️',
  color: 'slate',
  colorHex: '#64748b',
  domain: 'legal',
  description: 'Legal and compliance expert',
  systemPrompt: `You are Lex, a legal and compliance expert...`,
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  keywords: ['legal', 'law', 'contract', 'compliance', 'gdpr', ...],
  capabilities: ['Legal Analysis', 'Contract Review', 'Compliance'],
  active: true,
}
```

## License

MIT
