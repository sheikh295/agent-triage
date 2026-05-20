import { prisma } from '@/app/lib/db'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const conversations = await prisma.conversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
    return Response.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return Response.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const conversation = await prisma.conversation.create({
      data: {
        title: body.title ?? 'New Conversation',
      },
    })
    return Response.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return Response.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
