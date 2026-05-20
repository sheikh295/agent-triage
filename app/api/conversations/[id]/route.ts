import { NextRequest } from 'next/server';
import { getConversation, deleteConversation } from '@/lib/memory/store';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conversation = getConversation(id);
  if (!conversation) {
    return Response.json({ error: 'Conversation not found' }, { status: 404 });
  }
  return Response.json({ conversation });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteConversation(id);
  return Response.json({ success: deleted });
}
