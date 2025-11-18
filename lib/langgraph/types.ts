import { z } from 'zod'
import { BaseMessage } from '@langchain/core/messages'

// Agent state schema with routing support
export const AgentStateSchema = z.object({
  messages: z.array(z.any()),
  next: z.string().optional(),
  data: z.record(z.any()).optional(),
})

export type AgentState = z.infer<typeof AgentStateSchema>

// Enhanced agent state with routing information
export interface MultiAgentState {
  messages: BaseMessage[]
  next?: string // Which node to route to next
  data?: Record<string, any> // Additional data for agents
}

// Agent response types
export interface AgentResponse {
  message: string
  state?: AgentState
  error?: string
}

// Node names for routing
export const NodeNames = {
  SUPERVISOR: 'supervisor',
  WEATHER: 'weather',
  NEWS: 'news',
  GENERAL: 'general',
  END: 'END',
} as const

export type NodeName = (typeof NodeNames)[keyof typeof NodeNames]

