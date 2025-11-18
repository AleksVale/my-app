import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { MultiAgentState, NodeNames } from '../types'
import { weatherTool } from '../tools/weather'

/**
 * Weather agent node that handles weather-related queries
 */
export async function weatherAgentNode(state: MultiAgentState): Promise<Partial<MultiAgentState>> {
  const messages = state.messages || []
  const lastUserMessage = [...messages].reverse().find((m) => m._getType() === 'human')

  if (!lastUserMessage) {
    return {
      messages: [new AIMessage('I need a question to help you with weather information.')],
      next: state.data?.needsNews ? NodeNames.NEWS : NodeNames.END,
    }
  }

  // Initialize LLM with tool binding
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    temperature: 0,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  }).bindTools([weatherTool])

  try {
    console.log('🌤️ Weather agent processing query...')

    // Invoke LLM with tools
    const response = await llm.invoke(messages)

    // Check if the model wants to use tools
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log('🔧 Weather agent using tool:', response.tool_calls[0].name)

      // Execute the weather tool
      const toolCall = response.tool_calls[0]
      const toolResult = await weatherTool.invoke(toolCall.args)

      console.log('✅ Weather tool result obtained')

      // Create a final response incorporating the tool result
      const finalLLM = new ChatGoogleGenerativeAI({
        modelName: 'gemini-2.0-flash',
        temperature: 0.3,
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      })

      const finalMessages = [
        ...messages,
        new AIMessage('Let me get the weather information for you.'),
        new HumanMessage(`Here is the weather data:\n\n${toolResult}\n\nPlease provide a natural, conversational response based on this data.`),
      ]

      const finalResponse = await finalLLM.invoke(finalMessages)

      return {
        messages: [...messages, new AIMessage(finalResponse.content)],
        next: state.data?.needsNews ? NodeNames.NEWS : NodeNames.END,
      }
    } else {
      // Model responded without using tools
      return {
        messages: [...messages, response],
        next: state.data?.needsNews ? NodeNames.NEWS : NodeNames.END,
      }
    }
  } catch (error) {
    console.error('Weather agent error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      messages: [...messages, new AIMessage(`I encountered an error while fetching weather information: ${errorMessage}`)],
      next: state.data?.needsNews ? NodeNames.NEWS : NodeNames.END,
    }
  }
}

