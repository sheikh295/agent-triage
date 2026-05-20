import { NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { getAllConversations, getOrCreateConversation, deleteConversation } from '@/lib/memory/store';

export async function GET() {
  const conversations = getAllConversations();
  return Response.json({
    conversations: conversations.map(c => ({
      id: c.id,
      title: c.title,
      lastMessage: c.messages.filter(m => m.role === 'assistant').at(-1)?.content?.slice(0, 100) ?? '',
      lastAgentId: c.activeAgentId,
      lastAgentName: c.messages.filter(m => m.agentId).at(-1)?.agentName ?? 'Nova',
      lastAgentEmoji: c.messages.filter(m => m.agentEmoji).at(-1)?.agentEmoji ?? '✨',
      timestamp: c.updatedAt,
      messageCount: c.messages.length,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = (body as { id?: string }).id ?? nanoid();
  const conversation = getOrCreateConversation(id);
  return Response.json({ conversation });
}
