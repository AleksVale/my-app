import * as ai from "ai";
import { traceable } from "langsmith/traceable";
import { wrapAISDK } from "langsmith/experimental/vercel";
import { BaseMessage } from "@langchain/core/messages";
import { AgentGraph } from "../langgraph/graph";

// Check if LangSmith is configured
const isLangSmithEnabled =
  process.env.LANGSMITH_API_KEY &&
  process.env.LANGSMITH_TRACING === 'true'

// Wrap the AI SDK with LangSmith if enabled
const { generateText, streamText, generateObject, streamObject } =
  isLangSmithEnabled
    ? wrapAISDK(ai)
    : ai;

/**
 * Create a traceable function for LangSmith observability
 */
export function createTraceable<T extends (...args: unknown[]) => unknown>(
  fn: T,
  name: string
): T {
  if (!isLangSmithEnabled) {
    return fn
  }

  try {
    return traceable(fn, { name }) as T
  } catch (error) {
    console.warn('Failed to create traceable function:', error)
    return fn
  }
}

/**
 * Wrap LangGraph graph execution with LangSmith tracing
 * Uses the actual return type from AgentGraph.invoke()
 */
export function traceGraphExecution(
  fn: (messages: BaseMessage[]) => ReturnType<AgentGraph['invoke']>,
  graphName: string
): (messages: BaseMessage[]) => ReturnType<AgentGraph['invoke']>

/**
 * Generic version for tracing any async function with LangSmith
 */
export function traceGraphExecution<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  graphName: string
): T

/**
 * Implementation
 */
export function traceGraphExecution<TFunc extends (...args: unknown[]) => Promise<unknown>>(
  fn: TFunc,
  graphName: string
): TFunc {
  return createTraceable(fn, `langgraph:${graphName}`)
}

// Export the wrapped AI SDK functions
export { generateText, streamText, generateObject, streamObject }

