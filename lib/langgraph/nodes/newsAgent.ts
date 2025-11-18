import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIMessage, AIMessageFields, HumanMessage } from '@langchain/core/messages'
import { MultiAgentState, NodeNames } from '../types'
import { newsTool } from '../tools/news'
import { StructuredToolCallInput } from '@langchain/core/tools'

/**
 * News agent node that handles news-related queries
 */
export async function newsAgentNode(state: MultiAgentState): Promise<Partial<MultiAgentState>> {
  const messages = state.messages || []
  const lastUserMessage = [...messages].reverse().find((m) => m._getType() === 'human')

  if (!lastUserMessage) {
    return {
      messages: [new AIMessage('I need a question to help you with news information.')],
      next: 'END',
    }
  }

  // Initialize LLM with tool binding
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    temperature: 0,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }).bindTools([newsTool])

  try {
    // Invoke LLM with tools
    const response = await llm.invoke(messages)

    // Check if the model wants to use tools
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Execute the news tool
      const toolCall = response.tool_calls[0]
      const toolResult = await newsTool.invoke(toolCall.args as StructuredToolCallInput<typeof newsTool.schema>)

      // Create a final response incorporating the tool result
      const finalLLM = new ChatGoogleGenerativeAI({
        modelName: 'gemini-2.0-flash',
        temperature: 0.3,
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      })

      const finalMessages = [
        ...messages,
        new AIMessage('Let me search for the latest news for you.'),
        new HumanMessage(`Here are the news articles:\n\n${toolResult}\n\nPlease provide a natural, conversational summary of these articles.`),
      ]

      const finalResponse = await finalLLM.invoke(finalMessages)

      return {
        messages: [...messages, new AIMessage(finalResponse.content as string | AIMessageFields)],
        next: 'END',
      }
    } else {
      // Model responded without using tools
      return {
        messages: [...messages, response],
        next: 'END',
      }
    }
  } catch (error) {
    console.error('News agent error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      messages: [...messages, new AIMessage(`I encountered an error while fetching news: ${errorMessage}`)],
      next: 'END',
    }
  }
}

