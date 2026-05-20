import { prisma } from '@/app/lib/db'
import { streamWithAgent } from '@/app/lib/agents/orchestrator'
import type { Message } from '@/app/lib/providers/types'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, message, agentId } = body

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    let conversation = conversationId
      ? await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 60),
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    })

    const history: Message[] = (conversation.messages ?? []).map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }))

    const encoder = new TextEncoder()
    let fullResponse = ''
    let selectedAgentId = agentId ?? 'general'
    let selectedAgentName = 'General Assistant'
    let handoffReason = ''
    const newConvId = conversation.id

    const stream = new ReadableStream({
      async start(controller) {
        function send(data: object) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        }

        try {
          send({ type: 'conversation', conversationId: newConvId })

          await streamWithAgent({
            messages: history,
            userMessage: message,
            agentId,
            onAgentSelected: (id, name, reason) => {
              selectedAgentId = id
              selectedAgentName = name
              handoffReason = reason
              send({ type: 'agent', agentId: id, agentName: name, reason })
            },
            onChunk: (text) => {
              fullResponse += text
              send({ type: 'chunk', text })
            },
          })

          await prisma.message.create({
            data: {
              conversationId: newConvId,
              role: 'assistant',
              content: fullResponse,
              agentId: selectedAgentId,
              agentName: selectedAgentName,
              metadata: { handoffReason },
            },
          })

          if ((conversation?.messages?.length ?? 0) === 0) {
            const title = message.slice(0, 60) + (message.length > 60 ? '...' : '')
            await prisma.conversation.update({
              where: { id: newConvId },
              data: { title },
            })
          } else {
            await prisma.conversation.update({
              where: { id: newConvId },
              data: { updatedAt: new Date() },
            })
          }

          send({ type: 'done', conversationId: newConvId })
        } catch (error) {
          console.error('Stream error:', error)
          send({ type: 'error', error: 'Failed to generate response' })
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
