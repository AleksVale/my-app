import { streamText } from '@/lib/ai/langsmith'
import { google } from '@ai-sdk/google'
import { convertToModelMessages } from 'ai'

// Allow streaming responses up to 30 seconds (from documentation)
export const maxDuration = 30
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Optional: Verify user authentication
    // Uncomment to require authentication
    // const supabase = await createClient()
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser()
    //
    // if (!user) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages)

    // Stream the response using Google Gemini with LangSmith observability
    const result = await streamText({
      model: google('gemini-2.0-flash'),
      messages: modelMessages,
    })

    // Return UIMessage stream response as per documentation
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

