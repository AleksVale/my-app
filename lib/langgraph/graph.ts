import { StateGraph, END, START, MemorySaver } from '@langchain/langgraph'
import { BaseMessage } from '@langchain/core/messages'
import { MultiAgentState, NodeNames } from './types'
import { supervisorNode } from './nodes/supervisor'
import { weatherAgentNode } from './nodes/weatherAgent'
import { newsAgentNode } from './nodes/newsAgent'
import { generalAgentNode } from './nodes/generalAgent'

/**
 * Creates and compiles the multi-agent graph with checkpointing
 */
export function createAgentGraph() {
  // Create memory saver for checkpointing
  const checkpointer = new MemorySaver()

  // Create the graph using fluent API
  const graph = new StateGraph<MultiAgentState>({
    channels: {
      messages: {
        reducer: (current: BaseMessage[], update: BaseMessage[]) => {
          // Append new messages to existing ones
          return [...current, ...update]
        },
        default: () => [],
      },
      next: {
        reducer: (current: string | undefined, update: string | undefined) => {
          // Always use the most recent routing decision
          return update ?? current
        },
        default: () => undefined,
      },
      data: {
        reducer: (current: Record<string, unknown> | undefined, update: Record<string, unknown> | undefined) => {
          // Merge data objects
          return { ...current, ...update }
        },
        default: () => ({}),
      },
    },
  })
    .addNode(NodeNames.SUPERVISOR, supervisorNode)
    .addNode(NodeNames.WEATHER, weatherAgentNode)
    .addNode(NodeNames.NEWS, newsAgentNode)
    .addNode(NodeNames.GENERAL, generalAgentNode)
    .addEdge(START, NodeNames.SUPERVISOR)
    .addConditionalEdges(
    NodeNames.SUPERVISOR,
    (state: MultiAgentState) => {
      // Route based on the 'next' field set by supervisor
        return state.next || 'END'
    },
    {
      [NodeNames.WEATHER]: NodeNames.WEATHER,
      [NodeNames.NEWS]: NodeNames.NEWS,
      [NodeNames.GENERAL]: NodeNames.GENERAL,
        'END': END,
    }
  )
    .addConditionalEdges(
    NodeNames.WEATHER,
    (state: MultiAgentState) => {
      // If we need news after weather, go to news, otherwise end
        return state.next || 'END'
    },
    {
      [NodeNames.NEWS]: NodeNames.NEWS,
        'END': END,
    }
  )
    .addEdge(NodeNames.NEWS, END)
    .addEdge(NodeNames.GENERAL, END)
    .compile({ checkpointer })

  return graph
}

/**
 * Get or create a checkpoint saver instance
 */
export function getCheckpointSaver() {
  return new MemorySaver()
}

/**
 * Type for the compiled graph
 */
export type AgentGraph = ReturnType<typeof createAgentGraph>

