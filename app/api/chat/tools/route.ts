import { generateText } from '@/lib/ai/langsmith'
import { google } from '@ai-sdk/google'
import { dynamicTool } from 'ai'
import { z } from 'zod'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Example with tools and LangSmith observability
    // This endpoint demonstrates how to use tools with the Vercel AI SDK
    // All calls are automatically traced in LangSmith if configured
    const result = await generateText({
      model: google('gemini-2.0-flash'), // Using proven model
      system: 'You are a helpful assistant.',
      messages: messages || [
        { role: 'user', content: 'What is the weather in San Francisco?' },
      ],
      tools: {
        getWeather: dynamicTool({
          description: 'Get weather for a given city.',
          inputSchema: z.object({
            city: z.string().describe('The city to get the weather for'),
          }),
          execute: async (input) => {
            // Here you would call a real weather API
            // This is just an example - replace with actual API call
            const { city } = input as { city: string }
            return `It's always sunny in ${city}!`
          },
        }),
      },
      // Optional: Limit the number of tool calls
      // stopWhen: stepCountIs(5), // Use stepCountIs from 'ai' to limit steps
    })

    return Response.json(result)
  } catch (error) {
    console.error('Chat with tools API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
