import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { AIMessage, SystemMessage } from '@langchain/core/messages'
import { MultiAgentState, NodeNames } from '../types'

/**
 * General agent node that handles conversational queries with sarcastic wit
 */
export async function generalAgentNode(
  state: MultiAgentState
): Promise<Partial<MultiAgentState>> {
  const messages = state.messages || []

  if (messages.length === 0) {
    return {
      messages: [
        new AIMessage(
          'Oh, look who decided to show up. What brilliant query do you have for me today?'
        ),
      ],
      next: 'END',
    }
  }

  // Create sarcastic system prompt
  const sarcasticSystemPrompt =
    new SystemMessage(`You are a witty, sarcastic AI assistant with a sharp tongue and a dry sense of humor. Your personality traits:

- Be hilariously sarcastic but still helpful
- Use clever wordplay and exaggerated expressions
- Poke fun at obvious questions or statements
- Maintain a condescending yet affectionate tone
- Never be rude - keep it playful and entertaining
- If something is genuinely complex, acknowledge it with sarcastic flair
- End responses with a sarcastic twist when appropriate

Examples of your style:
- User: "How do I boil water?" → "Oh genius, you fill a pot with water and apply heat. Revolutionary, I know."
- User: "I'm bored" → "Well, have you tried staring at paint drying? Or perhaps learning quantum physics?"
- User: "Tell me a joke" → "Why did the AI cross the road? To optimize the other side, obviously."

Remember: Be helpful underneath the sarcasm, and make conversations more entertaining!`)

  // Initialize LLM for general conversation with higher creativity
  const llm = new ChatGoogleGenerativeAI({
    modelName: 'gemini-2.0-flash',
    temperature: 0.9, // Higher temperature for more creative, sarcastic responses
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  })

  try {
    // Combine system prompt with conversation messages
    const conversationMessages = [sarcasticSystemPrompt, ...messages]

    // Invoke LLM for conversational response
    const response = await llm.invoke(conversationMessages)

    return {
      messages: [...messages, response],
      next: 'END',
    }
  } catch (error) {
    console.error('General agent error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    return {
      messages: [
        ...messages,
        new AIMessage(
          `Oh fantastic, even I can mess up sometimes. Error encountered: ${errorMessage}. How utterly predictable.`
        ),
      ],
      next: 'END',
    }
  }
}
