import * as ai from 'ai'
import { wrapAISDK } from 'langsmith/experimental/vercel'

// Wrap the AI SDK functions with LangSmith for observability
export const { generateText, streamText } = wrapAISDK(ai)

