import { z } from 'zod'

// Agent state schema
export const AgentStateSchema = z.object({
  messages: z.array(z.any()),
  next: z.string().optional(),
  data: z.record(z.any()).optional(),
})

export type AgentState = z.infer<typeof AgentStateSchema>

// Agent response types
export interface AgentResponse {
  message: string
  state?: AgentState
  error?: string
}

