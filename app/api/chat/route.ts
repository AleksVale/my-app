import { streamText } from '@/lib/ai/langsmith'
import { google } from '@ai-sdk/google'
import { createClient } from '@/lib/supabase/server'

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

    // Stream the response using Google Gemini with LangSmith observability
    const result = await streamText({
      model: google('gemini-pro'),
      messages,
      maxTokens: 2000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

