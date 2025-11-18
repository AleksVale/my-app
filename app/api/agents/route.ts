import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/langgraph/agent'
import { createClient } from '@/utils/supabase/server'
import { HumanMessage, AIMessage } from '@langchain/core/messages'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds for agent execution

export async function POST(req: NextRequest) {
  try {
    const { messages, agentType } = await req.json()

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
      if (msg.role === 'user') {
        return new HumanMessage(msg.content)
      } else {
        return new AIMessage(msg.content)
      }
    })

    // Run the agent
    const result = await runAgent(langchainMessages)

    // Extract the last AI message
    const lastMessage = result.messages[result.messages.length - 1]
    const responseText = lastMessage?.content || 'No response generated'

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

