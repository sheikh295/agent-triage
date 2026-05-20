import { AGENTS } from '@/app/lib/agents/registry'

export async function GET() {
  return Response.json(AGENTS)
}
