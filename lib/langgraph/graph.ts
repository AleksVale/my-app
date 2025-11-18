import { StateGraph, END, MemorySaver, Checkpoint } from '@langchain/langgraph'
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
  // Define the state channels
  const graphBuilder = new StateGraph<MultiAgentState>({
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
        reducer: (current: Record<string, any> | undefined, update: Record<string, any> | undefined) => {
          // Merge data objects
          return { ...current, ...update }
        },
        default: () => ({}),
      },
    },
  })

  // Add all nodes to the graph
  graphBuilder.addNode(NodeNames.SUPERVISOR, supervisorNode)
  graphBuilder.addNode(NodeNames.WEATHER, weatherAgentNode)
  graphBuilder.addNode(NodeNames.NEWS, newsAgentNode)
  graphBuilder.addNode(NodeNames.GENERAL, generalAgentNode)

  // Set the entry point
  graphBuilder.setEntryPoint(NodeNames.SUPERVISOR)

  // Add conditional edges from supervisor to agents
  graphBuilder.addConditionalEdges(
    NodeNames.SUPERVISOR,
    (state: MultiAgentState) => {
      // Route based on the 'next' field set by supervisor
      return state.next || NodeNames.END
    },
    {
      [NodeNames.WEATHER]: NodeNames.WEATHER,
      [NodeNames.NEWS]: NodeNames.NEWS,
      [NodeNames.GENERAL]: NodeNames.GENERAL,
      [NodeNames.END]: END,
    }
  )

  // Add conditional edges from weather agent
  graphBuilder.addConditionalEdges(
    NodeNames.WEATHER,
    (state: MultiAgentState) => {
      // If we need news after weather, go to news, otherwise end
      return state.next || NodeNames.END
    },
    {
      [NodeNames.NEWS]: NodeNames.NEWS,
      [NodeNames.END]: END,
    }
  )

  // Add edges from other agents to END
  graphBuilder.addEdge(NodeNames.NEWS, END)
  graphBuilder.addEdge(NodeNames.GENERAL, END)

  // Create memory saver for checkpointing
  const checkpointer = new MemorySaver()

  // Compile the graph with checkpointing
  const graph = graphBuilder.compile({ checkpointer })

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

