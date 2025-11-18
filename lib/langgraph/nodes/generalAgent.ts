import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIMessage } from '@langchain/core/messages'
import { MultiAgentState, NodeNames } from '../types'

/**
 * General agent node that handles conversational queries
 */
export async function generalAgentNode(state: MultiAgentState): Promise<Partial<MultiAgentState>> {
  const messages = state.messages || []

  if (messages.length === 0) {
    return {
      messages: [new AIMessage('Hello! How can I help you today?')],
      next: NodeNames.END,
    }
  }

  // Initialize LLM for general conversation
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    temperature: 0.7,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  try {
    console.log('💬 General agent processing query...')

    // Invoke LLM for conversational response
    const response = await llm.invoke(messages)

    console.log('✅ General agent response generated')

    return {
      messages: [...messages, response],
      next: NodeNames.END,
    }
  } catch (error) {
    console.error('General agent error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      messages: [...messages, new AIMessage(`I encountered an error: ${errorMessage}`)],
      next: NodeNames.END,
    }
  }
}

