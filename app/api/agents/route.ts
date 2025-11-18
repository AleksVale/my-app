import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/langgraph/agent'
import { HumanMessage, AIMessage } from '@langchain/core/messages'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for agent execution

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Optional: Verify user authentication
    // Uncomment to require authentication
    // const supabase = await createClient()
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser()
    //
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Convert messages to LangChain format
    const langchainMessages = messages.map((msg: { role: string; content: string }) => {
      return new HumanMessage(msg.content)
    })

    // Run the agent
    const result = await runAgent(langchainMessages)

    // Extract the last AI message content
    const lastMessage = result.messages[result.messages.length - 1] as AIMessage | undefined
    let responseText = 'No response generated'

    if (lastMessage && typeof lastMessage.content === 'string') {
      responseText = lastMessage.content
    } else if (lastMessage && Array.isArray(lastMessage.content)) {
      responseText = lastMessage.content
        .filter((part: unknown) => typeof part === 'object' && part !== null && 'type' in part && part.type === 'text')
        .map((part: unknown) => {
          const textPart = part as { text?: string }
          return textPart.text || ''
        })
        .join('')
    }

    return NextResponse.json({
      message: responseText,
      state: result,
    })
  } catch (error) {
    console.error('Agent API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

