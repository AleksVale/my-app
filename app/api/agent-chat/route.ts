import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { HumanMessage, BaseMessage } from '@langchain/core/messages'
import { createAgentGraph } from '@/lib/langgraph/graph'
import {
  getOrCreateConversation,
  loadConversationMessages,
  saveMessage,
  generateThreadId,
} from '@/lib/langgraph/persistence'
import { traceGraphExecution } from '@/lib/ai/langsmith'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds for agent execution

/**
 * Agent chat endpoint with LangGraph orchestration
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, threadId: providedThreadId } = await req.json()

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🤖 Agent Chat API: User authenticated:', user.id)

    // Get or generate thread ID
    const threadId = providedThreadId || generateThreadId()
    console.log('🧵 Thread ID:', threadId)

    // Get or create conversation in Supabase
    const conversation = await getOrCreateConversation(user.id, threadId)

    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      )
    }

    console.log('💬 Conversation ID:', conversation.id)

    // Load existing messages from Supabase if this is a continuation
    let existingMessages: BaseMessage[] = []
    if (providedThreadId) {
      existingMessages = await loadConversationMessages(conversation.id)
      console.log('📚 Loaded', existingMessages.length, 'existing messages')
    }

    // Convert incoming messages to LangChain format
    const newUserMessage = messages[messages.length - 1]
    const userMessage = new HumanMessage(newUserMessage.content || newUserMessage.text || '')

    // Save user message to Supabase
    await saveMessage(
      conversation.id,
      'user',
      typeof userMessage.content === 'string' ? userMessage.content : JSON.stringify(userMessage.content)
    )

    // Combine existing and new messages
    const allMessages = [...existingMessages, userMessage]

    // Create the agent graph
    const graph = createAgentGraph()

    // Wrap graph execution with LangSmith tracing
    const tracedInvoke = traceGraphExecution(
      async (msgs: BaseMessage[]) => {
        return await graph.invoke(
          { messages: msgs },
          {
            configurable: {
              thread_id: threadId,
            },
          }
        )
      },
      'multi-agent-chat'
    )

    console.log('🚀 Invoking agent graph...')

    // Invoke the graph with LangSmith tracing
    const result = await tracedInvoke(allMessages)

    console.log('✅ Graph execution completed')

    // Extract the final assistant message
    const finalMessages = result.messages || []
    const lastMessage = finalMessages[finalMessages.length - 1]

    if (!lastMessage) {
      return NextResponse.json(
        { error: 'No response generated from agents' },
        { status: 500 }
      )
    }

    // Extract content from the last message
    let responseContent = ''
    if (typeof lastMessage.content === 'string') {
      responseContent = lastMessage.content
    } else if (Array.isArray(lastMessage.content)) {
      responseContent = lastMessage.content
        .filter((part: unknown): part is { type: string; text?: string } =>
          typeof part === 'object' && part !== null && typeof part === 'object' && 'type' in part && part.type === 'text' && 'text' in part
        )
        .map((part: { type: string; text?: string }) => part.text || '')
        .join('')
    } else {
      responseContent = JSON.stringify(lastMessage.content)
    }

    // Save assistant message to Supabase
    await saveMessage(conversation.id, 'assistant', responseContent, {
      agent_type: result.next || 'general',
    })

    console.log('💾 Messages saved to Supabase')

    // Return response in a format compatible with useChat
    return NextResponse.json({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: responseContent,
      threadId: threadId,
      conversationId: conversation.id,
    })
  } catch (error) {
    console.error('Agent Chat API error:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

