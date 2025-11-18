
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { AgentState } from './types'

// Helper function to run the agent (simplified version)
export async function runAgent(messages: (HumanMessage | AIMessage)[]): Promise<AgentState> {
  // Initialize the LLM only when needed (not during build time)
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash', // Keep original working model
    temperature: 0,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  const response = await llm.invoke(messages)

  return {
    messages: [...messages, response],
    next: undefined,
    data: {},
  }
}

