import { getActiveAgents } from '@/lib/agents/registry';
import { getAvailableProviders } from '@/lib/providers/factory';

export async function GET() {
  const agents = getActiveAgents();
  const availableProviders = getAvailableProviders();

  return Response.json({
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      color: a.color,
      colorHex: a.colorHex,
      domain: a.domain,
      description: a.description,
      provider: a.provider,
      model: a.model,
      capabilities: a.capabilities,
      active: a.active,
      providerAvailable: availableProviders.includes(a.provider),
    })),
    availableProviders,
  });
}
