import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { loadConversationMessages } from '@/lib/langgraph/persistence'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

export const runtime = 'nodejs'

/**
 * GET /api/conversations/[id] - Load a specific conversation with messages
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Load messages
    const messages = await loadConversationMessages(conversationId)

    // Convert LangChain messages to plain objects for JSON response
    const serializedMessages = messages.map((msg, index) => {
      const isHuman = msg._getType() === 'human'
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)

      return {
        id: `msg_${index}`,
        role: isHuman ? 'user' : 'assistant',
        content: content,
        parts: [{ type: 'text', text: content }],
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({
      conversation,
      messages: serializedMessages
    })
  } catch (error) {
    console.error('Load conversation API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
