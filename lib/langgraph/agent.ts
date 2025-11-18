import { StateGraph, END, START } from '@langchain/langgraph'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import { AgentState } from './types'

// Define the agent node
const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const messages = (state.messages || []) as BaseMessage[]

  // Initialize the LLM only when needed (not during build time)
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash', // Keep original working model
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  })

  // Process the messages through the LLM
  const response = await llm.invoke(messages)

  return {
    messages: [...messages, response],
  }
}

// Create the graph
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      reducer: (x: BaseMessage[], y: BaseMessage[]) => [...x, ...y],
      default: () => [],
    },
    next: {
      reducer: (x: string | undefined, y: string | undefined) => y ?? x,
      default: () => undefined,
    },
    data: {
      reducer: (x: Record<string, any> | undefined, y: Record<string, any> | undefined) => ({ ...x, ...y }),
      default: () => ({}),
    },
  },
})

// Helper function to run the agent (simplified version)
export async function runAgent(messages: (HumanMessage | AIMessage)[]): Promise<AgentState> {
  // Initialize the LLM only when needed (not during build time)
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash', // Keep original working model
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  })

  const response = await llm.invoke(messages)

  return {
    messages: [...messages, response],
    next: undefined,
    data: {},
  }
}

