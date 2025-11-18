import { generateText, streamText } from 'ai'
import { wrapAISDKModel } from 'langsmith/wrappers/vercel'
import { traceable } from 'langsmith/traceable'

// Check if LangSmith is configured
const isLangSmithEnabled = 
  process.env.LANGSMITH_API_KEY && 
  process.env.LANGSMITH_TRACING === 'true'

/**
 * Wrap a model with LangSmith observability if configured
 */
export function wrapModelWithLangSmith<T>(model: T, name?: string): T {
  if (!isLangSmithEnabled) {
    return model
  }

  try {
    return wrapAISDKModel(model, { name })
  } catch (error) {
    console.warn('Failed to wrap model with LangSmith:', error)
    return model
  }
}

/**
 * Create a traceable function for LangSmith observability
 */
export function createTraceable<T extends (...args: any[]) => any>(
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
 */
export function traceGraphExecution<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  graphName: string
): T {
  return createTraceable(fn, `langgraph:${graphName}`)
}

// Export the AI SDK functions directly
export { generateText, streamText }

