import { StateGraph, END, START } from '@langchain/langgraph'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'
import { AgentState } from './types'

// Initialize the LLM with Google Gemini
const llm = new ChatGoogleGenerativeAI({
  modelName: 'gemini-pro',
  temperature: 0,
  apiKey: process.env.GOOGLE_API_KEY,
})

// Define the agent node
const agentNode = async (state: AgentState): Promise<Partial<AgentState>> => {
  const messages = (state.messages || []) as BaseMessage[]
  
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
  const response = await llm.invoke(messages)

  return {
    messages: [...messages, response],
    next: undefined,
    data: {},
  }
}

