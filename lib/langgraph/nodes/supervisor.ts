import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { MultiAgentState, NodeNames } from '../types'

/**
 * Supervisor node that analyzes user intent and routes to appropriate agents
 */
export async function supervisorNode(state: MultiAgentState): Promise<Partial<MultiAgentState>> {
  const messages = state.messages || []
  const lastMessage = messages[messages.length - 1]

  if (!lastMessage) {
    return {
      next: 'END',
    }
  }

  // Initialize LLM for intent analysis
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,

    temperature: 0  })

  // Create a prompt to analyze user intent
  const systemPrompt = new SystemMessage(`You are a supervisor AI that routes user queries to the appropriate specialized agent.

Analyze the user's message and determine which agent(s) should handle it:
- "weather": For weather-related queries (current weather, forecasts, temperature, etc.)
- "news": For news articles, current events, or information about recent happenings
- "general": For general questions, conversations, or anything else

You can route to multiple agents if the query requires both weather and news information.

Respond with ONLY ONE of these exact formats:
- "weather" (for weather queries)
- "news" (for news queries)
- "general" (for general queries)
- "weather,news" (for queries needing both)
- "news,weather" (for queries needing both)

Examples:
User: "What's the weather in Paris?" → "weather"
User: "Latest news about AI" → "news"
User: "Hello, how are you?" → "general"
User: "What's the weather in NYC and any news about climate change?" → "weather,news"`)

  const analysisMessages = [systemPrompt, lastMessage]

  try {
    const response = await llm.invoke(analysisMessages)
    const routing = response.content.toString().trim().toLowerCase()

    // Determine next node based on routing
    if (routing.includes('weather') && routing.includes('news')) {
      // For multi-agent queries, we'll go to weather first, then news
      return {
        next: NodeNames.WEATHER,
        data: {
          ...state.data,
          needsNews: true, // Flag to indicate news is also needed
        },
      }
    } else if (routing.includes('weather')) {
      return {
        next: NodeNames.WEATHER,
      }
    } else if (routing.includes('news')) {
      return {
        next: NodeNames.NEWS,
      }
    } else {
      return {
        next: NodeNames.GENERAL,
      }
    }
  } catch (error) {
    console.error('Supervisor error:', error)
    // Default to general on error
    return {
      next: NodeNames.GENERAL,
    }
  }
}

