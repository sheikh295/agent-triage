import { prisma } from '@/app/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!conversation) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json(conversation)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return Response.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { title: body.title },
    })
    return Response.json(conversation)
  } catch (error) {
    console.error('Error updating conversation:', error)
    return Response.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.conversation.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return Response.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
